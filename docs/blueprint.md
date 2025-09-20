# **App Name**: AquaValuate

## Core Features:

- CSV Upload and Parsing: Allows users to upload CSV files containing groundwater heavy metal concentration data and automatically detects delimiters and encodings.
- Data Validation and Normalization: Validates and normalizes uploaded data, including units (e.g., µg/L to mg/L), coordinates (e.g., DMS to decimal degrees), and date formats, ensuring data consistency.
- Column Mapping: Enables users to map columns from their CSV files to standard fields required for HMPI calculation.
- HMPI Calculation Trigger: Triggers the calculation of Heavy Metal Pollution Indices (HMPI) using a pre-defined or user-configured formula.
- AI-Powered Missing Value Imputation: If enabled, leverage an AI model as a tool to impute reasonable missing values in heavy metal concentration data, leveraging contextual information such as location, depth and neighboring sample values, to make educated guesses, for scenarios with sporadic or incomplete datasets. Generates audit trail with imputed values to allow transparency.
- Interactive Map Display: Displays HMPI results on an interactive map with color-coded markers indicating pollution levels.
- Data Export: Enables users to export processed data and HMPI results in CSV, JSON, GeoJSON, or PDF formats.

## Style Guidelines:

- Primary color: Vibrant orange (#FF6600), representing energy and action related to environmental assessment.
- Background color: Black (#000000) for a modern, high-contrast appearance.
- Accent color: Light orange (#FF9933) as a subtle and contrasting color for highlights and call-to-action elements.
- Font: 'Inter', a grotesque-style sans-serif, suitable for both headlines and body text, providing a modern, clean and readable interface.
- Use simple, clear, and consistent icons to represent data types and actions. Icons should be monochromatic, using the primary color or a slightly darker shade for better visibility.
- Prioritize a clean, intuitive layout with a clear visual hierarchy. Use white space effectively to separate sections and improve readability.
- Implement subtle animations to enhance user experience, such as transitions between data views or loading indicators during data processing. Animations should be smooth and unobtrusive.