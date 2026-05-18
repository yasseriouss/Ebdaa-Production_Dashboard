import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { PDF_FONT_FAMILY } from "./fonts";

export type TableReportProps = {
  title: string;
  subtitle?: string;
  headers: string[];
  rows: string[][];
};

const styles = StyleSheet.create({
  page: {
    fontFamily: PDF_FONT_FAMILY,
    fontSize: 8,
    paddingTop: 32,
    paddingBottom: 40,
    paddingHorizontal: 28,
  },
  title: {
    fontSize: 13,
    marginBottom: 4,
    textAlign: "right",
  },
  subtitle: {
    fontSize: 8,
    color: "#666666",
    marginBottom: 12,
    textAlign: "right",
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#cccccc",
  },
  headerRow: {
    flexDirection: "row-reverse",
    backgroundColor: "#1a1a1a",
  },
  headerCell: {
    flex: 1,
    padding: 4,
    color: "#f5d547",
    fontSize: 7,
    textAlign: "right",
    borderRightWidth: 1,
    borderRightColor: "#333333",
  },
  bodyRow: {
    flexDirection: "row-reverse",
    borderTopWidth: 1,
    borderTopColor: "#dddddd",
  },
  bodyRowAlt: {
    backgroundColor: "#f5f5f5",
  },
  bodyCell: {
    flex: 1,
    padding: 4,
    fontSize: 7,
    textAlign: "right",
    borderRightWidth: 1,
    borderRightColor: "#eeeeee",
  },
  footer: {
    position: "absolute",
    bottom: 16,
    left: 28,
    right: 28,
    fontSize: 7,
    color: "#888888",
    textAlign: "center",
  },
});

function cellText(value: string, max = 48): string {
  const v = (value ?? "").trim() || "—";
  return v.length > max ? `${v.slice(0, max - 1)}…` : v;
}

export function TableReportDocument({ title, subtitle, headers, rows }: TableReportProps) {
  const generated = new Date().toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" });

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <View style={styles.table}>
          <View style={styles.headerRow}>
            {headers.map((h, i) => (
              <Text key={`h-${i}`} style={styles.headerCell}>
                {cellText(h, 24)}
              </Text>
            ))}
          </View>
          {rows.map((row, ri) => (
            <View key={`r-${ri}`} style={[styles.bodyRow, ri % 2 === 0 ? styles.bodyRowAlt : {}]}>
              {headers.map((_, ci) => (
                <Text key={`c-${ri}-${ci}`} style={styles.bodyCell}>
                  {cellText(row[ci] ?? "", 40)}
                </Text>
              ))}
            </View>
          ))}
        </View>
        <Text style={styles.footer}>
          Ebdaa Factory Data Hub · {generated} · {rows.length} صف
        </Text>
      </Page>
    </Document>
  );
}
