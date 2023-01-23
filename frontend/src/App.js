import './App.css';
import Header from './components/Header.js'
import SongDisplay from './components/SongDisplay.js'
import FeatureDropdowns from './components/FeatureDropdowns';
import 'bootstrap/dist/css/bootstrap.css';
import './components/component.css'

function App() {
  return (
    <div className="App">
      <div className="view-container">
        <Header/>
        <div className="page-title">[acapella match]</div>
        <SongDisplay/>
        <FeatureDropdowns/>
        <button className="match-button">match</button>
      </div>
    </div>
  );
}

export default App;
