import React, { Component, Fragment } from 'react';
import './App.css';
import Particles from 'react-particles-js';
import Navigation from './components/Navigation/Navigation';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';



// Particles.js options

const particlesOptions = {
                particles: {
                  number: {
                    value: 300,
                    density: {
                      enable: true, 
                      value_area: 800
                    }
                  }
                }
              }


const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: '',
  }
}

class App extends Component {
  constructor () {
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: '',

      }
    }
  }

loadUser = (user) => {
  const { id, name, email, entries, joined } = user;
  this.setState({ user: { id, name, email, entries, joined }});
}

// Getting the specicific coordintes from the percentages. We percentages times width and height

calculateFaceLocation = (data) => {
  const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
  const image = document.getElementById('inputimage');
  const width = Number(image.width);
  const height = Number(image.height);
  return {
    leftCol: clarifaiFace.left_col * width,
    topRow: clarifaiFace.top_row * height,
    rightCol: width - (clarifaiFace.right_col * width),
    bottomRow: height - (clarifaiFace.bottom_row * height),
    }
}


displayFaceBox = (box) => {
  this.setState({ box: box });
}

// Showing the changes in input

onInputChange = (event) => {
    this.setState({ input: event.target.value });
}

// Button that send the image to clarifai servers

pictureSubmit = () => {
  this.setState({ imageUrl: this.state.input });
    fetch('https://morning-thicket-02581.herokuapp.com//imageurl',{
          method:'post',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
           input: this.state.input
            })
        })
    .then(response => response.json())
    .then(response => {
      if(response) {
        fetch('https://morning-thicket-02581.herokuapp.com//image',{
          method:'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ 
            id: this.state.user.id 
          })
        })
        .then(response => response.json())
        .then(count => {
          this.setState(Object.assign(this.state.user, { entries: count }))
        })
        .catch(console.log)
      }
      this.displayFaceBox(this.calculateFaceLocation(response));
  })
    .catch(err => console.log(err)) 
}

onRouteChange = (route) => {
  if (route === 'signin'){
    this.setState(initialState);
  } else if (route === 'home') {
    this.setState({ isSignedIn: true});
  }
  this.setState({ route: route });
}


  render () {
    const { isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App">
        <Particles className='particles'
         params={particlesOptions} 
         />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
        { route === 'home' 
          ? <Fragment>
              <Logo />
              <Rank name={this.state.user.name} entries={this.state.user.entries}/>
              <ImageLinkForm 
                onInputChange={this.onInputChange} 
                pictureSubmit={this.pictureSubmit}
              />
              <FaceRecognition box={box} imageUrl={imageUrl}/>
            </Fragment>
          : (
              route === 'signin'
              ? <Signin onRouteChange={this.onRouteChange} loadUser={this.loadUser}/> 
              : <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser}/>
            )
        }
      </div>
    );
  }
}

export default App;
