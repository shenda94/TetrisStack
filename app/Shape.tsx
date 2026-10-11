import { View } from 'react-native';
import React, { Component } from 'react';
import { SHAPES, ShapeType } from './shapecomp'; // Mengambil SHAPES dari shapes.ts

// Interface untuk Props
interface ShapeProps {
  type: ShapeType;
}

class Shape extends Component<ShapeProps> {

  render() {
    const { type } = this.props;
    const shape = SHAPES[type];
    
    return (
      <View style={{ flexDirection: 'row' }}>
        {shape.map(row => (
          <View style={{ flexDirection: 'column' }}>
            {row.map(cell => (
              <View style={{ width: 20, height: 20, backgroundColor: cell === 1 ? 'red' : 'transparent' }} />
            ))}
          </View>
        ))}
      </View>
    );
  }
}


export default Shape;