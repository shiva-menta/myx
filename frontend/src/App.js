import './App.css';
import Song from './components/Song.js'
import Header from './components/Header.js'
import FeatureDropdowns from './components/FeatureDropdowns';
import 'bootstrap/dist/css/bootstrap.css';
import './components/component.css'

function App() {
  return (
    <div className="App">
      <Header/>
      <Song songName="Chopper" artistName="Mo Falk" img="chopper"/>
      <Song songName="Break My Heart" artistName="Dua Lipa" img="break_my_heart"/>
      <FeatureDropdowns/>
    </div>
  );
}

export default App;
