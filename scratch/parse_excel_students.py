import xlrd

wb = xlrd.open_workbook('2026.xls')
sheet = wb.sheet_by_index(0)

print(f"Total rows: {sheet.nrows}, cols: {sheet.ncols}")

# Print headers / first few rows
for r in range(min(15, sheet.nrows)):
    print(f"Row {r+1}: {[sheet.cell_value(r, c) for c in range(sheet.ncols)]}")

target_pns = [
    "61350054404", "61550054058", "61850051892", "61650051217", "61950053210",
    "61950049242", "01850165779", "61750046734", "61750048560", "61550046029",
    "61350044169", "61350043652", "61650038823", "61550036235", "61650035770",
    "61250033275", "61850036572", "61450032692", "61550036295", "61850036372",
    "01550114553", "60550043279", "61150026752", "01550058750", "61950023806",
    "61350025828", "61350019785", "01650027731", "61450018609", "61701099527"
]

print("\n--- MATCHING STUDENTS FROM EXCEL ---")
current_section = ""
for r in range(sheet.nrows):
    row_vals = [str(sheet.cell_value(r, c)).strip() for c in range(sheet.ncols)]
    row_str = " | ".join(row_vals)
    for pn in target_pns:
        if pn in row_str:
            print(f"Row {r+1}: {row_str}")
