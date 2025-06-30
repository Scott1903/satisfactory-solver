// InfoTooltip.js
import React from 'react';
import './InfoTooltip.css';

const InfoTooltip = ({ text }) => (
  <span className="tooltip-container">
    <span className="tooltip-icon">ℹ️</span>
    <div className="tooltip-text">
      <pre>{text}</pre>
    </div>
  </span>
);

export default InfoTooltip;