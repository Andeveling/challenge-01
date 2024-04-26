import { useState } from "react"
import { Toaster, toast } from "sonner"
import { uploadFile } from "./uplodaFile"
import { Data } from "./types"

const APP_STATUS = {
  IDLE: "idle",
  READY: "ready",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
} as const

const BUTTON_TEXT = {
  [APP_STATUS.IDLE]: "Upload",
  [APP_STATUS.READY]: "Upload",
  [APP_STATUS.LOADING]: "Uploading...",
  [APP_STATUS.SUCCESS]: "Uploaded",
  [APP_STATUS.ERROR]: "Upload",
} as const

type AppStatus = (typeof APP_STATUS)[keyof typeof APP_STATUS]

function App() {
  const [appStatus, setAppStatus] = useState<AppStatus>(APP_STATUS.IDLE)
  const [data, setData] = useState<Data>([])
  const [file, setFile] = useState<File | null>(null)
  console.log(data)
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const [file] = event.target.files ?? []
    if (!file) {
      return
    }
    setFile(file)
    setAppStatus(APP_STATUS.READY)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!file) {
      return
    }

    setAppStatus(APP_STATUS.LOADING)
    const [error, newData] = await uploadFile(file)
    if (error) {
      setAppStatus(APP_STATUS.ERROR)
      toast.error(error.message)
      return
    }
    setAppStatus(APP_STATUS.SUCCESS)
    if(newData) setData(newData)
    toast.success("File uploaded successfully")
  }

  const showButton = appStatus === APP_STATUS.READY || appStatus === APP_STATUS.ERROR

  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      <div>
        <Toaster />
        <h4 className='text-3xl font-bold mb-6'>Challenge: Upload CSV File</h4>

        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <label htmlFor='file'>
            <div className='label'>
              <span className='label-text'>Pick a file</span>
              <span className='label-text-alt'>Alt label</span>
            </div>
            <input
              id='file'
              onChange={handleInputChange}
              disabled={appStatus === APP_STATUS.LOADING}
              className='file-input file-input-bordered file-input-primary w-full'
              name='file'
              type='file'
              accept='.csv'
              title='Select CSV File'
              placeholder='Select CSV File'
            />
          </label>

          {showButton && (
            <button type='submit' className='btn btn-outline w-full'>
              {BUTTON_TEXT[appStatus]}
            </button>
          )}
        </form>
      </div>
    </main>
  )
}

export default App
