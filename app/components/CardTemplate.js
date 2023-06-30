
import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { CardActionArea, CardActions } from '@mui/material';
// import Link from 'next/link';
import { Link } from '@mui/material';
import { ToolsContext, UserContext } from './contexts';
import { Analysis } from './Analysis';
import { useContext, useState } from 'react';


export default function CardTemplate(props) {
  const [tool, setTool] = React.useState("");
  const [analysisContent, setAnalysisContent] = useState(<Analysis tool = {tool}/>);


  const {content, setContent} = useContext(UserContext);

  return (


    <UserContext.Provider value={{content, setContent}}>


    <Card onClick={() => {setContent(<Analysis tool = {props.title}/>)}} sx={{ border:1, maxWidth: 340, maxHeight : 300, p:1, width: 'auto' }}>
      <CardActionArea>
        <CardMedia
          component="img"
          height="140"
          image= {props.myImage}
          alt="green iguana"
        />

          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
            {props.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
            {props.description}
            </Typography>
          </CardContent>

      </CardActionArea>
      <CardActions>

      <Link
          component="button"
          // variant="button"
          variant="body2"
          // onClick={() => {
          //   setContent(newContent);
          // }}                                    
        >
          {/* Proceed to analysis page */}
      </Link>
      

      </CardActions>
    </Card>

    </UserContext.Provider>


  );
}

// idea : take the tool name + usage + analyze + replace usage with results