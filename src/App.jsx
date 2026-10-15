import { useState, useEffect } from 'react';
import './App.css';

function App() {
  // --- NAPI LISTA MENTÉSE ÉS BETÖLTÉSE ---
  const [entries, setEntries] = useState(() => {
    const savedEntries = localStorage.getItem('dailyEntries');
    return savedEntries ? JSON.parse(savedEntries) : [];
  });

  // Minden alkalommal, amikor az 'entries' változik, elmentjük a localStorage-be
  useEffect(() => {
    localStorage.setItem('dailyEntries', JSON.stringify(entries));
  }, [entries]);


  // --- KEDVENCEK MENTÉSE ÉS BETÖLTÉSE ---
  const [savedFoods, setSavedFoods] = useState(() => {
    const saved = localStorage.getItem('savedFoods');
    return saved ? JSON.parse(saved) : [
      { id: 'default1', name: 'BioTech Iso Whey (vízzel)', protein: 22, carbs: 1, fat: 0, calories: 110 }
    ];
  });

  useEffect(() => {
    localStorage.setItem('savedFoods', JSON.stringify(savedFoods));
  }, [savedFoods]);


  // --- ŰRLAP KEZELÉSE ---
  const [form, setForm] = useState({
    time: '',
    name: '',
    protein: '',
    carbs: '',
    fat: '',
    calories: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.calories) return;

    const newEntry = {
      id: Date.now(),
      time: form.time || new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' }),
      name: form.name,
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fat: Number(form.fat) || 0,
      calories: Number(form.calories) || 0
    };

    setEntries([...entries, newEntry]);
    setForm({ time: '', name: '', protein: '', carbs: '', fat: '', calories: '' });
  };

  const handleSaveFood = () => {
    if (!form.name || !form.calories) {
      alert("Az étel nevének és kalóriaértékének megadása kötelező a mentéshez!");
      return;
    }

    const newSavedFood = {
      id: Date.now().toString(),
      name: form.name,
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fat: Number(form.fat) || 0,
      calories: Number(form.calories) || 0
    };

    setSavedFoods([...savedFoods, newSavedFood]);
  };

  const loadSavedFood = (food) => {
    setForm({
      time: form.time,
      name: food.name,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      calories: food.calories
    });
  };

  const deleteSavedFood = (e, id) => {
    e.stopPropagation();
    if(window.confirm("Biztosan törlöd ezt a kedvenc ételt?")) {
      setSavedFoods(savedFoods.filter(food => food.id !== id));
    }
  };

  const handleClearDaily = () => {
    if(window.confirm("Biztosan törlöd a mai listát? Tiszta lappal indulsz!")) {
      setEntries([]); // Ez automatikusan kiüríti a localStorage-t is a useEffect miatt!
    }
  };

  // --- MATEMATIKA ---
  const totals = entries.reduce(
    (acc, curr) => ({
      calories: acc.calories + curr.calories,
      protein: acc.protein + curr.protein,
      carbs: acc.carbs + curr.carbs,
      fat: acc.fat + curr.fat
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const TARGET_CALORIES = 1800;
  const caloriePercent = Math.min(Math.round((totals.calories / TARGET_CALORIES) * 100), 100);

  const totalMacroCals = (totals.protein * 4) + (totals.carbs * 4) + (totals.fat * 9);
  const pPercent = totalMacroCals ? Math.round(((totals.protein * 4) / totalMacroCals) * 100) : 0;
  const cPercent = totalMacroCals ? Math.round(((totals.carbs * 4) / totalMacroCals) * 100) : 0;
  const fPercent = totalMacroCals ? Math.round(((totals.fat * 9) / totalMacroCals) * 100) : 0;

  return (
    <div className="app-wrapper">
      
      {/* BAL OSZLOP: Fő Tracker */}
      <div className="tracker-container">
        
        <div className="summary-panel">
          <div className="summary-header">📊 Napi Összesítő</div>
          
          <div className="summary-grid">
            <div className="summary-card" style={{ borderColor: '#3b82f6' }}>
              <span>Kalória</span>
              <strong>{totals.calories}</strong>
            </div>
            <div className="summary-card" style={{ borderColor: '#86efac' }}>
              <span>Fehérje</span>
              <strong style={{ color: '#86efac' }}>{totals.protein}g</strong>
            </div>
            <div className="summary-card" style={{ borderColor: '#fcd34d' }}>
              <span>Szénhidrát</span>
              <strong style={{ color: '#fcd34d' }}>{totals.carbs}g</strong>
            </div>
            <div className="summary-card" style={{ borderColor: '#fca5a5' }}>
              <span>Zsír</span>
              <strong style={{ color: '#fca5a5' }}>{totals.fat}g</strong>
            </div>
          </div>

          <div className="progress-container">
            <div className="progress-label">
              <span>Napi Kalóriakeret ({TARGET_CALORIES} kcal)</span>
              <span>{caloriePercent}%</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-fill" style={{ width: `${caloriePercent}%`, backgroundColor: caloriePercent > 95 ? '#ef4444' : '#3b82f6' }}></div>
            </div>
          </div>

          <div className="progress-container" style={{ marginBottom: 0 }}>
            <div className="progress-label">
              <span>Makró Eloszlás (F / CH / ZS)</span>
              <span>{pPercent}% / {cPercent}% / {fPercent}%</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-fill macro-fill-protein" style={{ width: `${pPercent}%` }}></div>
              <div className="progress-fill macro-fill-carbs" style={{ width: `${cPercent}%` }}></div>
              <div className="progress-fill macro-fill-fat" style={{ width: `${fPercent}%` }}></div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <input type="time" name="time" value={form.time} onChange={handleChange} />
            <input type="text" name="name" placeholder="Étel neve (pl. Egészségkonyha ebéd)" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-macros">
            <input type="number" name="protein" placeholder="Fehérje (g)" value={form.protein} onChange={handleChange} />
            <input type="number" name="carbs" placeholder="CH (g)" value={form.carbs} onChange={handleChange} />
            <input type="number" name="fat" placeholder="Zsír (g)" value={form.fat} onChange={handleChange} />
            <input type="number" name="calories" placeholder="Kcal" value={form.calories} onChange={handleChange} required />
          </div>
          
          <div className="form-actions">
            <button type="submit" className="add-btn">+ Hozzáadás a napihoz</button>
            <button type="button" className="save-btn" onClick={handleSaveFood}>⭐ Mentés</button>
          </div>
        </form>

        <div className="entry-list">
          {entries.map((entry) => (
            <div key={entry.id} className="entry-card">
              <div>
                <span className="entry-time">{entry.time}</span>
                <strong>{entry.name}</strong>
                <div className="entry-macros">
                  <span style={{ color: '#86efac' }}>F: {entry.protein}g</span>
                  <span style={{ color: '#fcd34d' }}>CH: {entry.carbs}g</span>
                  <span style={{ color: '#fca5a5' }}>ZS: {entry.fat}g</span>
                </div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 'bold' }}>
                {entry.calories} kcal
              </div>
            </div>
          ))}
          
          {entries.length > 0 && (
            <>
              <div className="entry-card total-row">
                <div>
                  <strong style={{ color: '#aaa' }}>NAPI ÖSSZESEN:</strong>
                  <div className="entry-macros">
                    <span style={{ color: '#86efac', fontWeight: 'bold' }}>F: {totals.protein}g</span>
                    <span style={{ color: '#fcd34d', fontWeight: 'bold' }}>CH: {totals.carbs}g</span>
                    <span style={{ color: '#fca5a5', fontWeight: 'bold' }}>ZS: {totals.fat}g</span>
                  </div>
                </div>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#3b82f6' }}>
                  {totals.calories} kcal
                </div>
              </div>
              
              <button className="clear-btn" onClick={handleClearDaily}>
                🗑️ Napi lista törlése (Új nap indítása)
              </button>
            </>
          )}
        </div>
      </div>

      {/* JOBB OSZLOP: Kedvencek Sidebar */}
      <div className="saved-sidebar">
        <div className="saved-foods-header">⭐ Gyakori Ételek</div>
        <div className="saved-foods-grid">
          {savedFoods.map((food) => (
            <div key={food.id} className="saved-card" onClick={() => loadSavedFood(food)}>
              <button className="delete-saved-btn" onClick={(e) => deleteSavedFood(e, food.id)} title="Törlés">×</button>
              <div className="saved-card-title" title={food.name}>{food.name}</div>
              <div className="saved-card-macros">
                <span style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '13px', marginBottom: '4px' }}>{food.calories} kcal</span>
                <span>Fehérje: {food.protein}g</span>
                <span>Szénhidrát: {food.carbs}g</span>
                <span>Zsír: {food.fat}g</span>
              </div>
            </div>
          ))}
          {savedFoods.length === 0 && (
            <div style={{ color: '#666', fontSize: 13, textAlign: 'center', marginTop: 20 }}>
              Még nincsenek mentett ételeid.<br/>Töltsd ki az űrlapot, és nyomj a Mentés gombra!
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default App;