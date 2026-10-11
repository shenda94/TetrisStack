import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Button, TouchableOpacity, Text } from 'react-native';
import Board from './Board';
import { SHAPES, ShapeType } from './shapecomp';
import { INITIAL_GRID } from './Grid';
import { useLocalSearchParams } from 'expo-router'; // 1. Import useLocalSearchParams
import { getDB } from "../lib/dbtetris";
import GameOverModal from './GameOverModal'; // Import komponen dialog
import { useRouter } from 'expo-router';

const rotate = (shape: ShapeType): ShapeType => shape;

const SHAPE_KEYS = Object.keys(SHAPES) as ShapeType[];

/**
 * Fungsi untuk memutar matriks 2D sebesar 90 derajat (Clockwise)
 */

const Game: React.FC = () => {
  const router = useRouter();
  // Menerima parameter yang dikirim dari halaman Index
  const params = useLocalSearchParams();
  const { userId, userName, score, level_terkini, timing_level } = params;
  const rawScore = Array.isArray(score) ? score[0] : (score || "0");
  const initialScore = rawScore ? Number(rawScore) : 0;
  const rawLevel = Array.isArray(level_terkini) ? level_terkini[0] : (level_terkini || "0");
  const levelScore = rawLevel ? Number(rawLevel) : 0;

  const rawTiming = Array.isArray(timing_level) ? timing_level[0] : (timing_level || "0");
  const Leveltiming = rawTiming ? Number(rawTiming) : 0;

  const [sCore, setScore] = useState<number>(initialScore);
  const [level, setLevel] = useState<number>(levelScore);
  const [timing, setTiming] = useState<number>(Leveltiming);

  const [Gameover, setGameOver] = useState<Boolean>(false);
  const rotateMatrix = (matrix: number[][]): number[][] => {
  
  return matrix[0].map((_, columnIndex) =>
    matrix.map(row => row[columnIndex]).reverse()
  );
};

  const [shape, setShape] = useState<ShapeType>(
      () => SHAPE_KEYS[Math.floor(Math.random() * SHAPE_KEYS.length)]
    );

  // 2. Simpan matriks bentuk di state agar bisa diputar
  const [shapeMatrix, setShapeMatrix] = useState<number[][]>(
    () => SHAPES[shape]
  );

  const [grid, setGrid] = useState<number[][]>(INITIAL_GRID);
  const [x, setX] = useState<number>(4);
  const [y, setY] = useState<number>(0);

  // Fungsi untuk kembali ke halaman utama / menu
  const handleGoHome = () => {
    const currentUserName = Array.isArray(userId) ? userId[0] : (userId || "Player");
    updateScore(currentUserName,0);
    router.back(); // Atau router.replace('/') tergantung rute Expo Router Anda
  };

  const handleRestart = () => {
    const currentUserName = Array.isArray(userId) ? userId[0] : (userId || "Player");
    updateScore(currentUserName,0);
    setGameOver(false);
    setScore(0);
    setGrid(INITIAL_GRID);
  };
   
const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
// State matriks bentuk yang sedang aktif (diinisialisasi dari SHAPES)

//1. Fungsi deteksi tabrakan dengan dasar & balok lain
const checkCollision = (nextY: number, nextX: number, matrix: number[][]) => {
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c] !== 0) {
          const boardY = nextY + r;
          const boardX = nextX + c;

          // Cek jika melebihi batas bawah grid (19 baris)
          if (boardY >= grid.length) {
            return true; // Menyentuh dasar
          }

          // Cek tabrakan dengan balok yang sudah terkunci di grid
          if (boardY >= 0 && grid[boardY][boardX] !== 0) {
            return true;
          }
        }
      }
    }
    return false;
  };
 
//setScore(score);
  // 2. Game Loop (Penurunan Otomatis)
  useEffect(() => {
//Number currentScore = Array.isArray(score) ? score[0] : (score || "0");
//setScore(currentScore);
       

    const interval = setInterval(() => {
      setY(prevY => {
        // Cek apakah 1 langkah ke bawah (prevY + 1) menabrak dasar
        if (Gameover == false) {
          if (!checkCollision(prevY + 1, x, shapeMatrix)) {
            return prevY + 1; // Aman -> lanjut turun
          }

          // KETIKA MENYENTUH DASAR:
          lockShape(prevY, x, shapeMatrix);
          spawnNextShape();
        }

        return prevY;
        
      });
    }, timing);

    return () => clearInterval(interval);
  }, [x, shapeMatrix, grid]);

  // 3. Mengunci bentuk ke dalam grid
  const lockShape = (currentY: number, currentX: number, matrix: number[][]) => {
    
    setGrid(prevGrid => {
      const newGrid = prevGrid.map(row => [...row]);
      matrix.forEach((row, r) => {
        row.forEach((val, c) => {
          /*if (val !== 0 && currentY + r < newGrid.length) {
            alert("here");
            //ini jika sudah sampai dasar.
            newGrid[currentY + r][currentX + c] = val;
          }*/
         if (val !== 0) {
          const targetY = currentY + r;
          const targetX = currentX + c;

          // Cek keamanan batas atas, bawah, kiri, dan kanan
          const isYValid = targetY >= 0 && targetY < newGrid.length;
          const isXValid = targetX >= 0 && targetX < newGrid[0].length;

          if (isYValid && isXValid) {
            newGrid[targetY][targetX] = val;
          }
         }

        });
      });

      let linesCleared = 0;
         const filteredGrid = newGrid.filter(row => {
          const isRowFull = row.every(cell => cell !== 0);
          if (isRowFull) {
            linesCleared++; // Hitung berapa baris yang penuh
            return false;   // Hapus baris ini dari grid
          }
          return true;      // Pertahankan baris yang belum penuh
        });

        if (linesCleared > 0) {
        const numCols = newGrid[0].length;
        const emptyRows = Array.from({ length: linesCleared }, () => Array(numCols).fill(0));
        
        // Gabungkan baris kosong di atas dengan sisa grid di bawahnya
        const finalGrid = [...emptyRows, ...filteredGrid];

        // Hitung skor berdasarkan jumlah baris yang dibersihkan sekaligus
        let basePoints = 0;
        if (linesCleared === 1) basePoints = 100;
        else if (linesCleared === 2) basePoints = 300;
        else if (linesCleared === 3) basePoints = 500;
        else if (linesCleared >= 4) basePoints = 800; // Tetris!

        const earnedScore = basePoints * level;
        const total_score = sCore + earnedScore;

        // Update skor di state game
        //setScore(prevScore => prevScore + earnedScore);
        setScore(total_score);
        //insert score and update score
        //call function
        const currentUserName = Array.isArray(userId) ? userId[0] : (userId || "Player");
        updateScore(currentUserName,total_score);

        return finalGrid; // Kembalikan grid yang sudah dibersihkan dan digeser ke bawah
      }

      return newGrid;
    });
  };

  //
  const updateScore = async (currentUserId: string, newScore: number) => {
      const db = await getDB();
      //insert hist score
    const userId = currentUserId; // ID unik sederhana berdasarkan timestamp
    const id_hist = Date.now().toString(); // Anda bisa menggantinya dengan input dari TextInput
    const createdAt = new Date().toISOString();
    const skorTerkini = newScore.toString();
    const currentScore = newScore ; // Ambil dari state skor Anda
    let waktu = timing;

    // Cara 1: Menggunakan logika if-else manual
    let calculatedLevel = 1;
    if (currentScore > 5000) {
      calculatedLevel++;
    }
    else if (currentScore > 4000 && currentScore >= 5000) {
      calculatedLevel = 5;
    } else if (currentScore > 3000 && currentScore <= 4000) {
      calculatedLevel = 4;
    } else if (currentScore > 2000 && currentScore <= 3000) {
      calculatedLevel = 3;
    } else if (currentScore >= 1000 && currentScore <= 2000) {
      calculatedLevel = 2;
    }

    if (calculatedLevel >= 3) {
        waktu = waktu - 150;

        if (waktu == 0) {
            waktu = 50;
        }
    }
    else {
        waktu = waktu - 100;
    }

    setTiming(waktu);
    setLevel(calculatedLevel);
      
      try {
    await db.runAsync(
      `UPDATE t_user 
       SET score_terkini = ? , level = ?
       WHERE id = ?`, // Perhatikan: pakai 'id', bukan 'id_user'
      [
        newScore.toString(),
        calculatedLevel,
         // Konversi ke string jika kolom score_terkini bertipe TEXT
        currentUserId       // Variabel id user yang sedang aktif
      ]
    );
    console.log("Skor berhasil diperbarui di database!");

    await db.runAsync(
            `INSERT INTO t_score_his (id, id_user, created_at, score_terkini, level) VALUES (?, ?, ?, ?, ?)`,
            [id_hist, userId, createdAt, skorTerkini, calculatedLevel]
          );
          console.log("Score baru berhasil ditambahkan ke database.");

         /* let existingUser1 = await db.getFirstAsync(
        `SELECT * FROM t_score_his WHERE id_user = ? LIMIT 1`,
        [userId]
      );
    // Contoh implementasi di dalam komponen atau fungsi penambahan skor:
    console.log("History : " + existingUser1);*/
    

  } catch (error) {
    console.error("Gagal memperbarui skor:", error);
  }
  }

  // 4. Memunculkan bentuk baru dari atas
  const spawnNextShape = () => {
    const nextShapeKey = SHAPE_KEYS[Math.floor(Math.random() * SHAPE_KEYS.length)];
    const nextMatrix = SHAPES[nextShapeKey];

    if (checkCollision(0, 4, nextMatrix)) {
      setGameOver(true);
      //alert("test");
      return;
    }
    
    setShape(nextShapeKey);
    setShapeMatrix(SHAPES[nextShapeKey]);
    setY(0);
    setX(4);
  };


  
  // Memutar bentuk 90 derajat setiap kali tombol ditekan
  const rotateShape = () => {
    //setRotation(prev => (prev + 90) % 360);
    //setShapeMatrix()
    //setShapeMatrix(prevMatrix => rotateMatrix(prevMatrix));(shapeMatrix);
    setShapeMatrix(prevMatrix => rotateMatrix(prevMatrix));
  };

  const moveShapeLeft = () => {
    if (Gameover == false) {
        if (x > 0) {
            setX(prevX => prevX - 1);
        }
    }
  };

  const downShape = () => {
    if (Gameover == false) {
      const boardHeight = grid.length || 0; // Lebar papan (jumlah kolom)
      const shapeheight = shape.length || 0; // Lebar bentuk saat ini
      if (y + shapeheight < boardHeight) {
        if (!checkCollision(y + 1, x, shapeMatrix)) {
          setY(prevY => prevY + 1);
        }
      }
      else {
        lockShape(y, x, shapeMatrix);
        spawnNextShape();
      }
    }
  }

  const moveShapeRight = () => {
    if (Gameover == false) {
      //alert(grid[boardY][boardX]);
      
      //alert(grid.length);
      const boardWidth = grid[0]?.length || 0; // Lebar papan (jumlah kolom)
      const shapeWidth = shapeMatrix[0]?.length || 0; // Lebar bentuk saat ini
     // alert(boardWidth);
      if (x + shapeWidth < boardWidth) {
          setX(prevX => prevX + 1);
      }

      //alert(shapeMatrix.length);
      
    }
  };

  return (
    <View style={styles.container}>
 <View style={styles.titleRow}>
        <Text style={[styles.letter, { color: '#D4A373' }]}>T</Text>
        <Text style={[styles.letter, { color: '#2A9D8F' }]}>e</Text>
        <Text style={[styles.letter, { color: '#00B4D8' }]}>T</Text>
        <Text style={[styles.letter, { color: '#9D4EDD' }]}>R</Text>
        <Text style={[styles.letter, { color: '#E63946' }]}>i</Text>
        <Text style={[styles.letter, { color: '#1D3557' }]}>S</Text>
        <Text style={[styles.letter, { color: '#D4A373' }]}>T</Text>
        <Text style={[styles.letter, { color: '#00B4D8' }]}>a</Text>
        <Text style={[styles.letter, { color: '#9D4EDD' }]}>c</Text>
        <Text style={[styles.letter, { color: '#2A9D8F' }]}>K</Text>
      </View>


      <View style={styles.containerskorlevel}>
        <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>Score</Text>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreValue}>{sCore}</Text>
        </View>
      </View>

      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>Level</Text>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreValue}>{level}</Text>
        </View>
      </View>

      </View>
      


      <Board grid={grid} shapeMatrix={shapeMatrix} shape={shape} x={x} y={y} />

      <View style={styles.controlsContainer}>
       
        <TouchableOpacity style={[styles.controlBtn, styles.rotateBtn]} onPress={rotateShape}>
          <Text style={styles.btnText}>ROTATE</Text>
        </TouchableOpacity>

        <View style={styles.dPadRow}>
          <TouchableOpacity style={styles.controlBtn} onPress={moveShapeLeft}>
            <Text style={styles.btnText}>LEFT</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.controlBtn, styles.downBtn]} onPress={downShape}>
            <Text style={styles.btnText}>DOWN</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlBtn} onPress={moveShapeRight}>
            <Text style={styles.btnText}>RIGHT</Text>
          </TouchableOpacity>
        </View>
      </View>


<GameOverModal
        visible={Gameover as boolean}
        score={sCore}
        userName={Array.isArray(userName) ? userName[0] : (userName || "Player")}
        onRestart={handleRestart}
        onHome={handleGoHome}
      />

    </View>
    // Paste kode ini di dalam render utama kamu

  );
};

const styles = StyleSheet.create({
  /*container: {
    flex: 1,
    backgroundColor:'#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },*/

  container: {
    flex: 1,
    backgroundColor: '#171B20',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  controlsContainer: {
    marginTop: 24,
    width: '100%',
    maxWidth: 220,
    height:118,
    alignItems: 'center',
    gap: 12,
  },
  dPadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  controlBtn: {
    flex: 1,
    backgroundColor: '#2A303C',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    // Border tebal khas konsol/game
    borderWidth: 2,
    borderColor: '#3A4252',
    borderBottomWidth: 5, // Memberikan efek 3D / tombol timbul
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  rotateBtn: {
    backgroundColor: '#3B82F6', // Warna aksen biru untuk Rotate
    borderColor: '#60A5FA',
    width: '100%',
  },
  downBtn: {
    backgroundColor: '#22C55E', // Warna aksen hijau untuk Down
    borderColor: '#4ADE80',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
    fontFamily: 'monospace', // Pakai font retro jika ada
  },

  containerskorlevel: {
    flexDirection: 'row',        // Menyusun elemen ke samping (sejajar)
    justifyContent: 'space-around', // Memberi jarak seimbang antar papan skor
    alignItems: 'center',        // Meratakan posisi secara vertikal
    width: '100%',               // Mengambil lebar penuh container
    paddingHorizontal: 55,       // Jarak aman dari pinggir layar
    marginVertical: 10,
  },

  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  scoreLabel: {
    color: '#9CA3AF', // Warna abu-abu terang untuk label SCORE
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 4, // Efek spasi antar huruf sesuai gambar
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  scoreBox: {
    backgroundColor: '#1E232A', // Warna background kotak skor gelap
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 16, // Corner radius melengkung halus
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2A303C', // Border tipis untuk mempertegas bentuk
    // Shadow lembut
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  scoreValue: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: 'bold',
    letterSpacing: 2,
  },

  titleRow: {
    marginTop:5,
    marginBottom:0,
    flexDirection: 'row',
    alignItems: 'center',
    fontFamily: 'monospace',
  },
  letter: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },

});

export default Game;