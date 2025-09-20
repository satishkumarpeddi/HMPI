export type CsvData = (string | number)[][];
export type CsvHeader = string[];

export const StandardFields = {
  location_name: "Location Name",
  latitude: "Latitude",
  longitude: "Longitude",
  date: "Date",
  arsenic: "Arsenic (As)",
  cadmium: "Cadmium (Cd)",
  chromium: "Chromium (Cr)",
  copper: "Copper (Cu)",
  mercury: "Mercury (Hg)",
  lead: "Lead (Pb)",
  zinc: "Zinc (Zn)",
} as const;

export type StandardField = keyof typeof StandardFields;

export type ColumnMapping = {
  [key in StandardField]?: string;
};

export type ProcessedRow = {
  id: number;
  [key: string]: any;
};
