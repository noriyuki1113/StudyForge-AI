import { PDFParse } from "pdf-parse";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_CHARS = 8000;

export async function parsePdf(file: File): Promise<string> {
  if (file.size > MAX_SIZE) {
    throw new Error("ファイルサイズが大きすぎます。10MB以内のPDFを使用してください。");
  }

  const arrayBuffer = await file.arrayBuffer();
  const parser = new PDFParse({ data: arrayBuffer, verbosity: 0 });
  const result = await parser.getText();

  const text = result.text.trim();
  if (!text) {
    throw new Error("PDFからテキストを抽出できませんでした。スキャン画像のPDFは非対応です。テキスト入力をお試しください。");
  }

  return text.slice(0, MAX_CHARS);
}
