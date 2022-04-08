import React from 'react';
import './App.css';
import {SignatureComponent, Signature} from '@syncfusion/ej2-react-inputs';
import {ButtonComponent} from '@syncfusion/ej2-react-buttons';
function App() {
  let signObj: Signature | null;
  const OnSave=()=>{
    signObj?.save();
  }
  const OnClear=()=>{
    signObj?.clear();
  }
  return (
    <div className="App">
      <div id="actionBtn">
        <ButtonComponent onClick={OnSave}>Save</ButtonComponent>
        <ButtonComponent onClick={OnClear}>Clear</ButtonComponent>
      </div>
      <SignatureComponent ref={sign=> signObj = sign}
        backgroundColor='red' 
        strokeColor='white'
        velocity={1}
        disabled={true}
        minStrokeWidth={2}
        maxStrokeWidth={5}>
        {/* backgroundImage="https://www.syncfusion.com/blogs/wp-content/uploads/2019/11/blog_1x.jpg" */}
        </SignatureComponent>
    </div>
  );
}

export default App;
