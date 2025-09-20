import { ColumnMapping, CsvData, ProcessedRow, StandardField, StandardFields } from "./definitions";

// Constants for HMPI Calculation (World Health Organization standards for drinking water)
// Values in mg/L
const METAL_STANDARDS: Record<string, number> = {
  arsenic: 0.01,
  cadmium: 0.003,
  chromium: 0.05,
  copper: 2.0,
  mercury: 0.006,
  lead: 0.01,
  zinc: 5.0,
};

// Relative weights (can be adjusted)
const METAL_WEIGHTS: Record<string, number> = {
  arsenic: 1,
  cadmium: 1,
  chromium: 1,
  copper: 1,
  mercury: 1,
  lead: 1,
  zinc: 1,
};

export function arrayToCsv(data: CsvData): string {
  return data.map(row => row.join(',')).join('\n');
}

export function parseImputedCsv(csvString: string): ProcessedRow[] {
  const rows = csvString.trim().split('\n');
  const headers = rows.shift()?.split(',') || [];
  
  return rows.map((rowStr, rowIndex) => {
    const values = rowStr.split(',');
    const row: ProcessedRow = { id: rowIndex };
    
    headers.forEach((header, index) => {
      const value = values[index];
      if (value.endsWith('*')) {
        row[header] = parseFloat(value.slice(0, -1));
        row[`${header}_isImputed`] = true;
      } else {
        row[header] = isNaN(parseFloat(value)) ? value : parseFloat(value);
        row[`${header}_isImputed`] = false;
      }
    });
    return row;
  });
}

export function processRawData(data: CsvData, mapping: ColumnMapping): ProcessedRow[] {
    const headers = data[0] as string[];
    const body = data.slice(1);

    const mappedData = body.map((row, rowIndex) => {
        const newRow: ProcessedRow = { id: rowIndex };
        (Object.keys(mapping) as StandardField[]).forEach(field => {
            const csvHeader = mapping[field];
            if (csvHeader) {
                const headerIndex = headers.indexOf(csvHeader);
                if (headerIndex !== -1) {
                    newRow[field] = row[headerIndex];
                }
            }
        });
        return newRow;
    });

    return calculateHMPI(mappedData);
}

function calculateHMPI(data: ProcessedRow[]): ProcessedRow[] {
  return data.map(row => {
    let hpiSum = 0;
    let weightSum = 0;

    (Object.keys(StandardFields) as StandardField[]).forEach(field => {
        if (field.startsWith('location') || field === 'date' || field === 'latitude' || field === 'longitude') return;

        const concentration = parseFloat(row[field]);
        const standard = METAL_STANDARDS[field];
        const weight = METAL_WEIGHTS[field];

        if (!isNaN(concentration) && standard !== undefined && weight !== undefined) {
            hpiSum += weight * (concentration / standard);
            weightSum += weight;
        }
    });

    const hmpi = weightSum > 0 ? hpiSum / weightSum : 0;
    
    let pollutionLevel: 'Low' | 'Medium' | 'High';
    if (hmpi < 1) {
        pollutionLevel = 'Low';
    } else if (hmpi < 2) {
        pollutionLevel = 'Medium';
    } else {
        pollutionLevel = 'High';
    }

    return { ...row, hmpi: hmpi.toFixed(2), pollutionLevel };
  });
}

export function reprocessParsedData(data: ProcessedRow[]): ProcessedRow[] {
    return calculateHMPI(data);
}
