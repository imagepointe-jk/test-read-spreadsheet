import { ChangeEvent, useRef, useState } from "react";
import xlsx from "xlsx";
import { z } from "zod";

const objSchema = z.object({
  id: z.number(),
  name: z.string(),
  age: z.number(),
  pet: z.string().optional(),
});
const sheetSchema = z.array(objSchema);
type Sheet = z.infer<typeof sheetSchema>;

function App() {
  const [error, setError] = useState(undefined as string | undefined);
  const [sheet, setSheet] = useState(undefined as Sheet | undefined);
  const fileUploadRef = useRef(null);

  function fileUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files) return;
    const file = files[0];
    const fileUpload = fileUploadRef.current;
    if (fileUpload) {
      (fileUpload as any).value = "";
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const target = e.target;
      if (!target) return;
      const data = target.result;
      const workbook = xlsx.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0]; // Assuming the data is in the first sheet
      const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
      try {
        const parsed = sheetSchema.parse(jsonData);
        setSheet(parsed);
        setError(undefined);
      } catch (error) {
        setSheet(undefined);
        setError(
          "Error parsing the file. Check for invalid and/or blank data."
        );
      }
    };

    reader.readAsArrayBuffer(file);
  }

  return (
    <div>
      <input
        ref={fileUploadRef}
        type="file"
        name="file"
        id="file"
        onChange={fileUpload}
      />
      {error && <div style={{ color: "red" }}>{error}</div>}
      {sheet && (
        <div>
          {sheet.map((row) => (
            <div>{`ID: ${row.id}  |  Name: ${row.name}  |  Age: ${
              row.age
            }  |  Pet: ${row.pet || "(none)"}`}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
