import express from "express"
import { z, ZodError } from "zod";
import sheets, {SHEET_ID} from "./sheetClient.js"

const app = express();
const Schema = z.object({
  matchID: z.number().min(1, {message: "Match ID needed"}),
  thing: z.string()
})

app.use(express.json());
app.use(express.static( 'public', {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

app.post('/send-message', async (req, res) => {

  try {
    const body = Schema.parse(req.body);

    // Object to Sheets
    const rows = Object.values(body);
    console.log(rows);

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Data!A2',
      insertDataOption: 'INSERT_ROWS',
      valueInputOption: 'RAW',
      requestBody: {
        values: [rows],
      }
    });
    res.json({ message: 'Data added successfully' });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error });
    }
    console.log(error)
  }
});

app.listen(5000, () => console.log(`App running on http://localhost:5000`));