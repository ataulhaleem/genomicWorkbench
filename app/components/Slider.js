import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Card from "./Card";
import CardTemplate from "./CardTemplate";

export default function SimpleSlider() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return null; // Render null until the component is loaded on the client side
  }

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3,
    centerMode: true,
    centerPadding: "20px"
  };

  return (
    <Slider {...settings}>

    <div>
        <div>
        <CardTemplate
        myImage = './dataViz.jpg' 
        title = 'VisPheno' 
        description = 'A tool to create interactive plots with plotly.js, using data from a csv or the backend DB' />

        </div>
            
        <div>

        <CardTemplate
            myImage = './pca.png' 
            title = 'PCA' 
            description = 'Principle component analysis '
            />
            </div>
        <div>

            <CardTemplate
            myImage = './LDplot.png' 
            title = 'LD analysis' 
            description = 'Find correlations among genetic markers '
            />
            </div>
        <div>

            <CardTemplate
            myImage = './gwas.jpg' 
            title = 'GWAS' 
            description = 'Minecraft Dungeons is '
            />
            </div>

    </div>
        

    </Slider>
  );
}
