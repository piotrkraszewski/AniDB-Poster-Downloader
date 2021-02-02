import React from 'react'
import './AlertTemplate'
// import alert_image from '../images/alert.png'


export default function AlertTemplate ({ style, options, message, close }) {
  // diffrent color depending on passed option
  let color 
  if(options.type === 'info') color = 'info'
  else if (options.type === 'success') color = 'success'
  else if (options.type === 'error') color = 'error'

  return (
    <div className={`AlertTemplate ${color}`} style={style}>
      {options.type === 'info' && ''}
      {options.type === 'success' && ''}
      {options.type === 'error' && ''}
      <p>{message}</p>
      <button 
        className={'AlertTemplate-btn btn ' + color} 
        onClick={close}>
          X
      </button>
    </div>
)}