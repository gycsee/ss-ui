from __future__ import annotations

import json
import math
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET


NS = {
    "main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "rel": "http://schemas.openxmlformats.org/package/2006/relationships",
}

CONTAINER_FALLBACKS = {
    "45HQ": "45HC",
}


def col_to_num(col: str) -> int:
    total = 0
    for char in col:
        if char.isalpha():
            total = total * 26 + ord(char.upper()) - 64
    return total


def read_workbook(path: Path) -> dict[str, list[list[str]]]:
    with zipfile.ZipFile(path) as zf:
        shared_strings: list[str] = []
        if "xl/sharedStrings.xml" in zf.namelist():
            root = ET.fromstring(zf.read("xl/sharedStrings.xml"))
            for node in root.findall("main:si", NS):
                text = "".join(text_node.text or "" for text_node in node.iterfind(".//main:t", NS))
                shared_strings.append(text)

        workbook = ET.fromstring(zf.read("xl/workbook.xml"))
        relationships = ET.fromstring(zf.read("xl/_rels/workbook.xml.rels"))
        rel_map = {
            rel.attrib["Id"]: rel.attrib["Target"]
            for rel in relationships.findall("rel:Relationship", NS)
        }

        sheets: dict[str, list[list[str]]] = {}
        for sheet in workbook.find("main:sheets", NS):
            sheet_name = sheet.attrib["name"]
            rel_id = sheet.attrib[
                "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"
            ]
            target = rel_map[rel_id]
            if not target.startswith("xl/"):
                target = f"xl/{target}"

            root = ET.fromstring(zf.read(target))
            rows: list[list[str]] = []
            for row in root.findall(".//main:sheetData/main:row", NS):
                values: dict[int, str] = {}
                for cell in row.findall("main:c", NS):
                    ref = cell.attrib.get("r", "")
                    col = "".join(ch for ch in ref if ch.isalpha())
                    value_node = cell.find("main:v", NS)
                    if cell.attrib.get("t") == "inlineStr":
                        text_node = cell.find("main:is/main:t", NS)
                        value = text_node.text if text_node is not None else ""
                    elif value_node is None:
                        value = ""
                    else:
                        raw_value = value_node.text or ""
                        if cell.attrib.get("t") == "s":
                            value = shared_strings[int(raw_value)]
                        else:
                            value = raw_value
                    values[col_to_num(col)] = value

                if values:
                    max_col = max(values)
                    rows.append([values.get(i, "") for i in range(1, max_col + 1)])

            sheets[sheet_name] = rows

        return sheets


def rows_to_dicts(rows: list[list[str]]) -> list[dict[str, str]]:
    header = rows[0]
    return [dict(zip(header, row)) for row in rows[1:]]


def as_int(value: str) -> int:
    if value == "":
        return 0
    return int(round(float(value)))


def as_float(value: str) -> float:
    if value == "":
        return 0.0
    return float(value)


def compact_number(value: float) -> str:
    if math.isclose(value, round(value)):
        return str(int(round(value)))
    return f"{value:.1f}".rstrip("0").rstrip(".")


def make_packed_item(row: dict[str, str], cargo: dict[str, str]) -> dict[str, object]:
    quantity = max(as_int(cargo.get("num", "1")), 1)
    total_weight = as_float(cargo.get("weight", "0"))
    total_volume = as_float(cargo.get("volume", "0"))
    unit_weight = total_weight / quantity if quantity else total_weight
    unit_volume = total_volume / quantity if quantity else total_volume
    is_upright = cargo.get("is_upright") == "1"

    return {
        "id": f"loaded-{int(row['seq']):03d}-{row['sku_id']}",
        "groupKey": cargo.get("pickup_loc") or cargo.get("pkg_type") or cargo.get("order_id") or "UNKNOWN",
        "seq": int(row["seq"]),
        "posX": as_int(row["pos_x"]),
        "posY": as_int(row["pos_y"]),
        "posZ": as_int(row["pos_z"]),
        "xLength": as_int(row["x_length"]),
        "yLength": as_int(row["y_length"]),
        "zLength": as_int(row["z_length"]),
        "meta": {
            "title": row["sku_id"],
            "lines": [
                f"Order: {cargo.get('order_id', '-')}",
                f"Pickup: {cargo.get('pickup_loc', '-')} · {cargo.get('pkg_type', '-')}",
                f"Qty: {quantity} · Unit Wgt: {compact_number(unit_weight)} kg · Unit Vol: {compact_number(unit_volume)} m³",
                f"Priority: {cargo.get('load_priority', '-')} · Upright: {'Yes' if is_upright else 'No'}",
            ],
        },
    }


def make_unloaded_items(
    left_sku: dict[str, int],
    cargo_by_sku: dict[str, dict[str, str]],
    start_seq: int,
) -> list[dict[str, object]]:
    items: list[dict[str, object]] = []
    next_seq = start_seq
    for sku_id, quantity in left_sku.items():
        cargo = cargo_by_sku.get(sku_id, {})
        for index in range(quantity):
            next_seq += 1
            items.append(
                {
                    "id": f"left-{next_seq:03d}-{sku_id}-{index + 1}",
                    "groupKey": cargo.get("pickup_loc") or cargo.get("pkg_type") or cargo.get("order_id") or "UNASSIGNED",
                    "seq": next_seq,
                    "posX": 0,
                    "posY": 0,
                    "posZ": 0,
                    "xLength": as_int(cargo.get("length", "0")),
                    "yLength": as_int(cargo.get("width", "0")),
                    "zLength": as_int(cargo.get("height", "0")),
                    "meta": {
                        "title": sku_id,
                        "lines": [
                            f"Order: {cargo.get('order_id', '-')}",
                            f"Pickup: {cargo.get('pickup_loc', '-')} · {cargo.get('pkg_type', '-')}",
                            f"Backlog: {index + 1}/{quantity} · Priority: {cargo.get('load_priority', '-')}",
                            f"Total SKU Wgt: {compact_number(as_float(cargo.get('weight', '0')))} kg",
                        ],
                    },
                }
            )
    return items


def resolve_container(
    cargo_rows: list[dict[str, str]],
    container_rows: list[dict[str, str]],
) -> tuple[dict[str, object], str]:
    requested_type = cargo_rows[0]["container_type"]
    container_map = {row["type"]: row for row in container_rows}
    matched_type = requested_type
    if requested_type not in container_map:
        matched_type = CONTAINER_FALLBACKS.get(requested_type, requested_type)
    row = container_map[matched_type]
    return (
        {
            "innerLength": as_float(row["inner_length"]),
            "innerWidth": as_float(row["inner_width"]),
            "innerHeight": as_float(row["inner_height"]),
        },
        matched_type,
    )


def build_output(workbook_path: Path) -> dict[str, object]:
    sheets = read_workbook(workbook_path)
    cargo_rows = rows_to_dicts(sheets["cargo_info"])
    container_rows = rows_to_dicts(sheets["container_info"])
    loading_rows = rows_to_dicts(sheets["loading_result"])
    kpi_rows = rows_to_dicts(sheets["loading_kpi"])

    cargo_by_sku = {row["sku_id"]: row for row in cargo_rows}
    packed_items = [make_packed_item(row, cargo_by_sku[row["sku_id"]]) for row in loading_rows]

    left_sku = json.loads(kpi_rows[0]["left_sku"])
    unloaded_items = make_unloaded_items(left_sku, cargo_by_sku, start_seq=len(packed_items))
    container, matched_container_type = resolve_container(cargo_rows, container_rows)

    total_weight = as_float(kpi_rows[0]["total_weight"])
    total_volume = as_float(kpi_rows[0]["total_volume"])

    return {
        "sampleMeta": {
            "sourceFile": workbook_path.name,
            "cargoContainerType": cargo_rows[0]["container_type"],
            "dimensionContainerType": matched_container_type,
            "totalWeightKg": total_weight,
            "totalVolumeM3": total_volume,
            "loadRateVolume": as_float(kpi_rows[0]["load_rate_vol"]),
            "loadRateWeight": as_float(kpi_rows[0]["load_rate_wgt"]),
            "packedCount": len(packed_items),
            "unloadedCount": len(unloaded_items),
            "distinctUnloadedSkuCount": len(left_sku),
        },
        "container": container,
        "packedItems": packed_items,
        "unloadedItems": unloaded_items,
    }


def main() -> int:
    if len(sys.argv) != 3:
        print("Usage: generate_packing3d_sample_data.py <input.xlsx> <output.json>", file=sys.stderr)
        return 1

    input_path = Path(sys.argv[1]).resolve()
    output_path = Path(sys.argv[2]).resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)

    data = build_output(input_path)
    output_path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
