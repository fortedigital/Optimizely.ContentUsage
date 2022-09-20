import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

const container = document.getElementById('react-app');
const root = createRoot(container!);

// @ts-ignore
root.render(<App model={appModel}/>);
