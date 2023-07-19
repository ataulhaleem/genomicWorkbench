'use client';

import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import HomeIcon from '@mui/icons-material/Home';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HandymanIcon from '@mui/icons-material/Handyman';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import StorageIcon from '@mui/icons-material/Storage';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import EmailIcon from '@mui/icons-material/Email';
import { Documentation } from './Documentation';
import { DataManagement } from './DataManagement';
import { Tools } from './Tools';
import { FAQs } from './FAQs';
import { Contact } from './Contact';
import { UserContext } from './contexts';
import { useState, useContext } from 'react';
import  WelcomePage  from "./WelcomePage";

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);


export function MiniDrawer() {

  const homePage = <WelcomePage/>;
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(homePage);
  const [appBarTitle, setAppBarTitle] = useState("Genomics data Analysis workbench");
  
  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleDrawerContent = (text) => {
    if(text == 'Documentation'){
      var newContent = <Documentation/>;
    }else if(text == 'Data Management'){
      var newContent = <DataManagement/>;
    }else if(text== 'Tools'){
      var newContent = <Tools/>;
    }else if(text== 'FAQs'){
      var newContent = <FAQs/>;
    }else if(text== 'Contact'){
      var newContent = <Contact/>;
    }else if(text== 'Home'){
      var newContent = <WelcomePage/>;
    } 
  setContent(newContent);
}

  const handleAppBarTitle = (text) => {
    if(text== 'Documentation'){
      var newAppBarTitle = <h3>Documentation</h3>;
    } else if(text== 'Data Management'){
      var newAppBarTitle = <h3>Data Management</h3>;
    } else if(text== 'Tools'){
      var newAppBarTitle = <h3>Data Analysis Tools</h3>;
    }else if(text== 'FAQs'){
      var newAppBarTitle = <h3>FAQs</h3>;
    }else if(text== 'Contact'){
      var newAppBarTitle = <h3>Contact</h3>;
    }else if(text== 'Home'){
      var newAppBarTitle = <h3>Home</h3>;
    }
    setAppBarTitle(newAppBarTitle);
  }



  return (
    <>
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start" 
            sx={{
              marginRight: 5,
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>                                                       
          <Typography variant="h6" noWrap component="div">
            {appBarTitle}
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>

        <Divider />
        <List>
          {
            ['Home','Documentation', 'Data Management', 'Tools', 'FAQs', 'Contact'].map((text, index) => (
              <ListItem key={text} disablePadding sx={{ display: 'block' }}
              onClick={() => {handleDrawerContent(text); handleAppBarTitle(text);}}
              >
             
              <ListItemButton  sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'center',  px: 2.5,  }} id={text}  >              
              
                  <ListItemIcon  sx={{ minWidth: 0,  mr: open ? 3 : 'auto', justifyContent: 'center' }} >
                    {index != 0 || <HomeIcon />}
                    {index != 1 || <TextSnippetIcon /> }
                    {index != 2 || <StorageIcon /> }
                    {index != 3 || <HandymanIcon /> }
                    {index != 4 || <ContactSupportIcon />}
                    {index != 5 || <EmailIcon /> }
                  </ListItemIcon>
                  <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />

                  
              </ListItemButton>
              </ListItem>
          ))
          }
        </List>


      </Drawer>
      
      <UserContext.Provider value={{content, setContent}}>
        <Box component="main" sx={{ flexGrow: 1, p: 3}}>
        <DrawerHeader/>
        { content }
        </Box>

      </UserContext.Provider>
    </Box>


    </>
  );
}
