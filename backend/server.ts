import express from "express"
import cors from "cors"
import multer from "multer"
import { Request, Response } from "express"
import csvToJson from "convert-csv-to-json"
import morgan from "morgan"

const app = express()
const port = process.env.PORT ?? 3000
const storage = multer.memoryStorage()
const upload = multer({ storage })

let userData: Array<Record<string, string>> = []

app.use(cors())
app.use(morgan("dev"))

app.post("/api/files", upload.single("file"), async (req: Request, res: Response) => {
  // 1. Extract file from request
  const { file } = req
  // 2. Validate that we have a valid file
  if (!file) {
    return res.status(500).send({ message: "No file uploaded" })
  }

  // 3. Validate the mimetype (csv)
  if (file?.mimetype !== "text/csv") {
    return res.status(500).json({
      message: "Invalid file type ",
    })
  }
  // 4. Transform the File (Buffer) to String

  try {
    const result = Buffer.from(file?.buffer).toString("utf-8")
    // 5. Transform the String to CSV

    const json = csvToJson.fieldDelimiter(",").csvStringToJson(result)
    console.log(json)
    userData = json
    return res.status(200).send({ message: "File uploaded successfully", data: userData })

  } catch (error) {
    return res.status(500).send({ message: "Error parsing file" })
  }

  // 6. Save the CSV to JSON
  // 7. Return 200 with message and the json
})

app.get("/api/users", (req: Request, res: Response) => {
  // 1. Extract the query param "q" from the request
  const { q } = req.query
  // 2. Validate that we have a valid query param
  if (!q) {
    return res.status(500).send({ message: "No query param provided" })
  }
  if (Array.isArray(q)) {
    return res.status(500).send({ message: "Query param must be a string" })
  }
  // 3. Filter the data from db (or memory) with the query param
  const searchParam = q.toString().toLowerCase()
  const filteredData = userData.filter((row) => {
    return Object.keys(row).some((key) => {
      return String(row[key]).toLowerCase().includes(searchParam)
    })
  })
  // 4. Return 200 with the filtered data
  return res.status(200).send({ data: filteredData })
})

app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`)
})
