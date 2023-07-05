import React, { useState } from 'react'
import Aioli from "@biowasm/aioli";


export default function FastQC(props) {
  const url = props.url
  const [fastqData, setFastQdata] = useState(null)
  const [FastQCres, serFastQCres] = useState("")



  fetch(url)
  .then(res => res.blob()) // Gets the response and returns it as a blob
  .then(blob => {
    setFastQdata(blob);
    }
  )




  const biowasm = async () => {
    const CLI = await new Aioli(["fastp/0.20.1"]);
    await CLI.exec(`fastp -i ${fastqData}`);
    serFastQCres(await CLI.cat("fastp.json"));

  }

  biowasm()

  return (
    <div>{FastQCres}</div>
  )
}
