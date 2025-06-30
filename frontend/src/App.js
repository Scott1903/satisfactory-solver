import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import InfoTooltip from './components/InfoTooltip';

const App = () => {
  const [activeTab, setActiveTab] = useState('Resources');
  const [resourceLimits, setResourceLimits] = useState({});
  const [weights, setWeights] = useState({});
  const [inputs, setInputs] = useState({});
  const [outputs, setOutputs] = useState({});
  const [checkboxNuclearWaste, setCheckboxNuclearWaste] = useState(false);
  const [newInputItem, setNewInputItem] = useState("");
  const [newInputAmount, setNewInputAmount] = useState(0);
  const [newOutputItem, setNewOutputItem] = useState("");
  const [newOutputAmount, setNewOutputAmount] = useState(0);
  const [recipeList, setRecipeList] = useState([]);
  const [recipeToggles, setRecipeToggles] = useState({});
  const [recipeDisplayMap, setRecipeDisplayMap] = useState({});
  const [itemOptions, setItemOptions] = useState([]);
  const [itemDisplayMap, setItemDisplayMap] = useState({});
  const [resourceDisplayMap, setResourceDisplayMap] = useState({});
  const [result, setResult] = useState(null);

  const weightInfo = {
    'Power Use': 'Penalty for power used.\n\nThe total MW of power used to produce output.\n\nFor nuclear: 1 MW ≈ 0.143 resources\nFuel: 1 MW ≈ 0.055 resources\nSink: 1 MW ≈ 0.084 resources\n\nRecommended: 0.094 (resource opt), 0.3 (infra min)',
    'Item Use': 'Penalty for items to belt.\n\nSum of all items produced/recycled.\n\n≥ 0.4 removes screw recipes.\n\nRecommended: 0 (resource opt), 0.4 (simplify prod)',
    'Building Use': 'Penalty for machine count.\n\nTotal miners, smelters, assemblers, etc.\n\nRecommended: 0; use buildings_scaled instead.',
    'Resource Use': 'Penalty for raw resource use.\n\nAll resources scaled equally.\n\nRecommended: 0; use resources_scaled instead.',
    'Buildings Scaled': 'Penalty for complex machines.\n\nFormula: ((#in + #out - 1)^1.58)/3 * count\n\n1 Manuf = 3 Assemblers = 9 Constructors\n≥ 10 favors Smelters\n\nRecommended: 0 (resource opt), 30 (simplify prod)',
    'Resources Scaled': 'Penalty for rare resource use.\n\nResources scaled by user limits.\n\nSet high limit for Water to avoid penalty.\n\nRecommended: 1',
    'Nuclear Waste': 'Penalty for unsunk Nuclear Waste.\n\nCheckbox forces Ficsonium route.\n\nRecommended: 9999999 (very high)',
  };

  useEffect(() => {
    const fetchDefaultsAndMetadata = async () => {
      try {
        const [defaultRes, metaRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/api/default-settings/"),
          axios.get("http://127.0.0.1:8000/api/metadata/")
        ]);

        const defaultData = defaultRes.data;
        const { items, resources, recipes } = metaRes.data;

        const resourceMap = {};
        resources.forEach(r => {
          resourceMap[r.id] = r.name || r.id;
        });
        setResourceDisplayMap(resourceMap);
        setResourceLimits(defaultData.resource_limits || {});
        setWeights(defaultData.weights || {});
        setInputs(defaultData.inputs || {});
        setOutputs(defaultData.outputs || {});
        setCheckboxNuclearWaste(defaultData["checkbox_Nuclear Waste"] || false);

        const itemMap = {};
        const itemOptionsList = items.map(item => {
          itemMap[item.id] = item.name || item.id;
          return { id: item.id, name: item.name || item.id };
        }).sort((a, b) => a.name.localeCompare(b.name));
        setItemDisplayMap(itemMap);
        setItemOptions(itemOptionsList);

        const sortedRecipes = [...recipes].sort((a, b) => {
          const nameA = a.name || a.display || a.id;
          const nameB = b.name || b.display || b.id;
          return nameA.localeCompare(nameB);
        });

        const toggles = {};
        const displayMap = {};
        sortedRecipes.forEach(r => {
          toggles[r.id] = !(defaultData.recipes_off || []).includes(r.id);
          displayMap[r.id] = r.name || r.display || r.id;
        });

        setRecipeList(sortedRecipes);
        setRecipeToggles(toggles);
        setRecipeDisplayMap(displayMap);
      } catch (err) {
        console.error("Error loading defaults/metadata:", err);
      }
    };

    fetchDefaultsAndMetadata();
  }, []);

  const handleOptimize = async () => {
    const recipesOff = Object.entries(recipeToggles)
      .filter(([_, val]) => !val)
      .map(([key]) => key);

    const settings = {
      resource_limits: resourceLimits,
      weights: weights,
      recipes_off: recipesOff,
      inputs: inputs,
      outputs: outputs,
      max_item: false,
      "checkbox_Nuclear Waste": checkboxNuclearWaste
    };

    try {
      const response = await axios.post("http://127.0.0.1:8000/optimize/", { settings });
      setResult(response.data);
      setActiveTab('Results');
    } catch (error) {
      console.error("API error:", error);
      setResult({ error: "API request failed. Check console for details." });
    }
  };

  const renderSection = (title, object) => {
    if (!object || Object.keys(object).length === 0) return null;

    const sortedEntries = Object.entries(object).sort((a, b) => {
      const aName = itemDisplayMap[a[0]] || resourceDisplayMap[a[0]] || recipeDisplayMap[a[0]] || a[0];
      const bName = itemDisplayMap[b[0]] || resourceDisplayMap[b[0]] || recipeDisplayMap[b[0]] || b[0];
      return aName.localeCompare(bName);
    });

    return (
      <div className="section">
        <h3>{title}</h3>
        <ul>
          {sortedEntries.map(([key, value]) => (
            <li key={key}>
              <strong>{itemDisplayMap[key] || resourceDisplayMap[key] || recipeDisplayMap[key] || key}:</strong>
              {typeof value === 'object' ? (
                <ul>
                  {Object.entries(value).map(([subKey, subVal]) => (
                    <li key={subKey}>
                      {itemDisplayMap[subKey] || subKey}: {typeof subVal === 'number' ? subVal.toFixed(2) : subVal}
                    </li>
                  ))}
                </ul>
              ) : (
                <> {typeof value === 'number' ? value.toFixed(2) : value}</>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Resources':
        return (
          <div className="section">
            <h3>Resource Limits</h3>
            {Object.entries(resourceLimits).map(([key, value]) => (
              <div className="form-row" key={key}>
                <label>{resourceDisplayMap[key] || key}</label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setResourceLimits({ ...resourceLimits, [key]: parseFloat(e.target.value) })}
                />
              </div>
            ))}
          </div>
        );
      case 'Weights':
        return (
          <div className="section">
            <h3>Weights</h3>
            {Object.entries(weights).map(([key, value]) => (
              <div className="form-row" key={key}>
                <label>{key}</label>
                <div className="input-tooltip-wrapper">
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setWeights({ ...weights, [key]: parseFloat(e.target.value) })}
                  />
                  {weightInfo[key] && <InfoTooltip text={weightInfo[key]} />}
                </div>
              </div>
            ))}
            <div className="form-row">
              <label>Penalize Plutonium Fuel Rod sink</label>
              <input
                type="checkbox"
                checked={checkboxNuclearWaste}
                onChange={(e) => setCheckboxNuclearWaste(e.target.checked)}
              />
            </div>
          </div>
        );
      case 'Inputs/Outputs':
        return (
          <div className="section">
            <h3>Inputs</h3>
            <div className="input-group">
              <select value={newInputItem} onChange={e => setNewInputItem(e.target.value)}>
                <option value="">Select item</option>
                {itemOptions.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
              <input type="number" value={newInputAmount} onChange={e => setNewInputAmount(parseFloat(e.target.value))} placeholder="Amount" />
              <button onClick={() => {
                if (newInputItem) {
                  setInputs({ ...inputs, [newInputItem]: newInputAmount });
                  setNewInputItem(""); setNewInputAmount(0);
                }
              }}>Add Input</button>
            </div>
            <ul>{Object.entries(inputs).map(([k, v]) => (
              <li key={k}>{itemDisplayMap[k] || k}: {v} <button onClick={() => {
                const ni = { ...inputs }; delete ni[k]; setInputs(ni);
              }}>x</button></li>
            ))}</ul>

            <h3>Outputs</h3>
            <div className="input-group">
              <select value={newOutputItem} onChange={e => setNewOutputItem(e.target.value)}>
                <option value="">Select item</option>
                {itemOptions.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
              <input type="number" value={newOutputAmount} onChange={e => setNewOutputAmount(parseFloat(e.target.value))} placeholder="Amount" />
              <button onClick={() => {
                if (newOutputItem) {
                  setOutputs({ ...outputs, [newOutputItem]: newOutputAmount });
                  setNewOutputItem(""); setNewOutputAmount(0);
                }
              }}>Add Output</button>
            </div>
            <ul>{Object.entries(outputs).map(([k, v]) => (
              <li key={k}>{itemDisplayMap[k] || k}: {v} <button onClick={() => {
                const no = { ...outputs }; delete no[k]; setOutputs(no);
              }}>x</button></li>
            ))}</ul>
          </div>
        );
      case 'Recipes':
        const alternateRecipes = recipeList.filter(r => r.display.includes("Alternate"));
        const defaultRecipes = recipeList.filter(r => !r.display.includes("Alternate"));
        return (
          <div className="section" style={{ display: 'flex', gap: '2rem' }}>
            <div>
              <h3>Alternate Recipes</h3>
              {alternateRecipes.map(r => (
                <div key={r.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={recipeToggles[r.id] || false}
                      onChange={(e) => setRecipeToggles({ ...recipeToggles, [r.id]: e.target.checked })}
                    />
                    {r.display}
                  </label>
                </div>
              ))}
            </div>
            <div>
              <h3>Default Recipes</h3>
              {defaultRecipes.map(r => (
                <div key={r.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={recipeToggles[r.id] || false}
                      onChange={(e) => setRecipeToggles({ ...recipeToggles, [r.id]: e.target.checked })}
                    />
                    {r.display}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );
      case 'Results':
        return (
          <div className="section">
            <button onClick={handleOptimize}>Run Optimization</button>
            {result && (
              <div>
                <h2>Optimization Result</h2>

                <div className="section">
                  <h3>Overview</h3>
                  <ul>
                    <li><strong>Sink Points:</strong> {result.sink_points?.toFixed(1)}</li>
                    <li><strong>Power Use:</strong> {result.power_use?.toFixed(1)}</li>
                    <li><strong>Power Produced:</strong> {result.power_produced?.toFixed(1)}</li>
                    <li><strong>Item Use:</strong> {result.item_use?.toFixed(1)}</li>
                    <li><strong>Buildings:</strong> {result.buildings?.toFixed(1)}</li>
                    <li><strong>Resources:</strong> {result.resources?.toFixed(1)}</li>
                    <li><strong>Buildings Scaled:</strong> {result.buildings_scaled?.toFixed(1)}</li>
                    <li><strong>Resources Scaled:</strong> {result.resources_scaled?.toFixed(1)}</li>
                  </ul>
                </div>

                {renderSection("Items Input", result.items_input)}
                {renderSection("Items Output", result.items_output)}
                {renderSection("Resources Needed", result.resources_needed)}
                {renderSection("Items Needed", result.items_needed)}
                {renderSection("Recipes Used", result.recipes_used)}
                {renderSection("Ingredients Map", result.ingredients_map)}
                {renderSection("Products Map", result.products_map)}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Satisfactory LP Solver</h1>
      </header>

      <div className="section">
        <button onClick={() => setActiveTab('Resources')}>Resources</button>
        <button onClick={() => setActiveTab('Weights')}>Weights</button>
        <button onClick={() => setActiveTab('Inputs/Outputs')}>Inputs/Outputs</button>
        <button onClick={() => setActiveTab('Recipes')}>Recipes</button>
        <button onClick={() => setActiveTab('Results')}>Results</button>
      </div>

      {renderTabContent()}

      <footer className="app-footer">
        For <a href="https://www.satisfactorygame.com/" target="_blank" rel="noopener noreferrer">Satisfactory</a> version 1.0
        <p>Created by <a href="https://www.reddit.com/user/wrigh516" target="_blank" rel="noopener noreferrer">u/wrigh516</a>.  Github link coming soon.</p>
        <p>Adding the ability to login and save settings soon.</p>
      </footer>
    </div>
  );
};

export default App;