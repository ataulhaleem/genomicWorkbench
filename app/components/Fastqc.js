import React from 'react'
import Aioli from "@biowasm/aioli";

export default function FastQC() {
    const CLI = await new Aioli(["fastp/0.20.1"]);
    await CLI.exec("fastp -i /fastp/testdata/R1.fq");
    const output = await CLI.cat("fastp.json");
  return (
    <div>FastQC</div>
  )
}
