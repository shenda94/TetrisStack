import { Text, StyleSheet, View } from 'react-native'
import React, { Component } from 'react'
import Shape from './Shape';
import { INITIAL_GRID } from './Grid';
import { SHAPES, ShapeType } from './shapecomp'; // Mengambil SHAPES dari shapes.ts

interface BoardProps {
  shape: ShapeType;
  x: number;
  y: number;
  grid: number[][];
  shapeMatrix: number[][];
}

interface BoardState {
  grid: number[][];
}

// Helper untuk memutar matriks 2D sebesar 90 derajat searah jarum jam
const rotateMatrix = (matrix: number[][]): number[][] => {
  return matrix[0].map((_, columnIndex) =>
    matrix.map(row => row[columnIndex]).reverse()
  );
};

export default class Board extends Component<BoardProps, BoardState> {
  // Proyeksikan shapeMatrix ke salinan grid utama
  getRenderGrid = (): number[][] => {
    const { grid, shapeMatrix, x, y } = this.props;
    const gridCopy = grid.map(row => [...row]);

    if (!shapeMatrix) return gridCopy;

    for (let r = 0; r < shapeMatrix.length; r++) {
      for (let c = 0; c < shapeMatrix[r].length; c++) {
        if (shapeMatrix[r][c] !== 0) {
          const boardY = y + r;
          const boardX = x + c;

          if (
            boardY >= 0 &&
            boardY < gridCopy.length &&
            boardX >= 0 &&
            boardX < gridCopy[0].length
          ) {
            gridCopy[boardY][boardX] = shapeMatrix[r][c];
          }
        }
      }
    }

    return gridCopy;
  };

 /*state = {
    grid: INITIAL_GRID
  };*/
  
// Helper fungsi dipasang di dalam class
  getTetromino = (shape: ShapeType, x: number, y: number): number[][] => {
    // Buat salinan grid state
    const gridCopy = this.state.grid.map(row => [...row]);
    const shapeMatrix = SHAPES[shape];

    if (!shapeMatrix) return gridCopy;

    // Tempelkan matriks bentuk Tetris ke grid berdasarkan koordinat (x, y)
    for (let r = 0; r < shapeMatrix.length; r++) {
      for (let c = 0; c < shapeMatrix[r].length; c++) {
        if (shapeMatrix[r][c] === 1) {
          const boardY = y + r;
          const boardX = x + c;

          if (
            boardY >= 0 &&
            boardY < gridCopy.length &&
            boardX >= 0 &&
            boardX < gridCopy[0].length
          ) {
            //alert("here");
            gridCopy[boardY][boardX] = 1;
          }
        }
      }
    }

    return gridCopy;
  };

  render() {
    const { shape, x, y } = this.props;
    const renderGrid = this.getRenderGrid();
    //const grid = this.getTetromino(shape, x, y);

    return (
      <View style={styles.gameContainer}>
        {renderGrid.map((row, i) => (
          <View style={{ flexDirection: 'row' }} key={i}>
            {row.map((cell, j) => (
              <View 
                style={{ 
                  width: 20, 
                  height: 20, 
                  backgroundColor: cell === 1 ? 'purple' : 'transparent' 
                }} 
                key={j} 
              />
            ))}
          </View>
        ))}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center'
  },
  gameContainer: {
    width: 200,
    height: 400,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20, 
    margin:0,
    paddingLeft:0,
  },
})