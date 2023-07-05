import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic';
const gff = dynamic(() => require('@gmod/gff').default);
const fs = dynamic(() => require('fs').default);
import useSWR from 'swr'

import axios from 'axios';

import fetch from 'node-fetch';

const fetcher = (...args) => fetch(...args).then((res) => res.json())



function Gff3Reader(props) {
    const [gffData, setGffData] = useState(null)
    const [file, setFile] = useState("")
    var url = props.url
    const url1 = 'https://cors-anywhere.herokuapp.com/' + url;

    useEffect(() => {
        console.log(url1)
        fetch(url1)
            .then(res => res.blob()) // Gets the response and returns it as a blob
            .then(blob => {       
            setFile(blob);
            }
        )        
		const reader = new FileReader();
		reader.onload = async ({ target }) => {
            setGffData(target.data)
        reader.readAsText(file);
        }
    },[])

  return (
    <div>{gffData}</div>
  )
}

export default Gff3Reader