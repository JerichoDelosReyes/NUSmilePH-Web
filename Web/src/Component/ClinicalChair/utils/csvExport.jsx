/**
 * Utility function to export data to CSV
 * @param {Array} data - Array of objects to export
 * @param {String} filename - Name of the CSV file
 * @param {Array} [customHeaders] - Optional custom headers for the CSV
 */
export const exportToCSV = (data, filename, customHeaders = null) => {
  if (!data || data.length === 0) {
    console.error("No data to export");
    return;
  }

  try {
    // Get headers from the data or use custom headers
    const headers =
      customHeaders ||
      Object.keys(data[0]).filter(
        (key) =>
          !key.startsWith("_") &&
          !["password", "salt", "__v"].includes(key) &&
          typeof data[0][key] !== "object"
      );

    // Create CSV header row
    let csvContent = headers.join(",") + "\r\n";

    // Add data rows
    data.forEach((item) => {
      const row = headers.map((header) => {
        const value = item[header] === undefined ? "" : item[header];

        // Handle special characters and formatting
        if (
          typeof value === "string" &&
          (value.includes(",") || value.includes('"') || value.includes("\n"))
        ) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });

      csvContent += row.join(",") + "\r\n";
    });

    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${filename}-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error("Error exporting to CSV:", error);
    return false;
  }
};

/**
 * Format a date string to YYYY-MM-DD
 * @param {String} dateString - Date string to format
 * @returns {String} Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toISOString().split("T")[0];
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};
