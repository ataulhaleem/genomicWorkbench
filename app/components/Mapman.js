import React, { useEffect, useState } from 'react';

const Mapman = (props) => {
  const [svgContent, setSvgContent] = useState('');

  useEffect(() => {
    const fetchSvg = async () => {
      try {
        const response = await fetch(props.src);
        const svgData = await response.text();
        // Process the data here and update the SVG content accordingly
        const updatedSvgContent = processSvgData(svgData, props.data);
        setSvgContent(updatedSvgContent);
      } catch (error) {
        console.error('Error fetching SVG:', error);
      }
    };

    fetchSvg();
  }, [props.src, props.data]);

  // Function to process SVG data based on some data
  const processSvgData = (svgData, data) => {
    // Here, you can use 'data' to modify the SVG content
    // For example, you can change colors, update text, or adjust shapes
    // For demonstration purposes, let's assume we change the fill color of a circle
    const updatedSvgData = svgData.replace('fill="blue"', `fill="${data.circleColor}"`);
    return updatedSvgData;
  };

  return (
    <div dangerouslySetInnerHTML={{ __html: svgContent }} />
  );
};

export default Mapman;
