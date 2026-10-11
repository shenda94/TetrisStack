import { useEffect, useState } from "react"; // 1. Import useEffect
import { Text, View, TouchableOpacity, StyleSheet, Alert, BackHandler } from "react-native";
import { useRouter } from 'expo-router';
import Game from "./Game";
import { createUserTable } from "../lib/schema";
import { createScoreHis } from "../lib/scorehis"
import { getDB } from "../lib/dbtetris";
import { Label } from "@react-navigation/elements";
import GameHighScoreModal from './Gamehighscore'; // Import komponen dialog

export default function Index() {
  const router = useRouter();

  // 2. Inisialisasi tabel saat komponen pertama kali dibuka
  useEffect(() => {
    async function initDB() {
      try {
        await createUserTable();
        await createScoreHis(); // Tambahkan await di sini
        console.log("Database initialized successfully!");
      } catch (error) {
        console.error("Failed to initialize database:", error);
      }
    }

    initDB();
  }, []); // Array kosong [] memastikan fungsi ini hanya berjalan 1x saat screen dimuat

const handleGoHome = () => {
  setHighscoremodal(false);
  };

  const [sCore, setScore] = useState<number>(0);
  const [level, setLevel] = useState<number>(0);
  const [nmplayer, setPlayer] = useState<string>("0");
  const [highscoremdl, setHighscoremodal] = useState<boolean>(false);
  

  const highscoremodal = async () => {
    const db = await getDB();
    const userId = "user_tetris_1";

    type UserType = {
        id: string;
        nm_user: string;
        level: string;
        created_at: string;
        score_terkini: string;
      };

      let existingUser = await db.getFirstAsync<UserType>(
        `SELECT * FROM t_score_his WHERE id_user = ? ORDER BY CAST(score_terkini AS INTEGER) DESC LIMIT 1`,
        [userId]
      );

      console.log(userId);
      console.log("ISI DARI existingUser:", existingUser);
      // 1. Cek apakah data ditemukan
      if (existingUser) {
        
        setScore(Number(existingUser.score_terkini));
        setLevel(Number(existingUser.level));
        setPlayer("Player 1");
        setHighscoremodal(true);
        console.log(existingUser.score_terkini);
      } else {
        setScore(0);
        setLevel(1);
        setPlayer("Player 1");
        setHighscoremodal(true);
        console.log("Data skor untuk user tersebut tidak ditemukan.");
      }

  };

  const handleExitApp = () => {
  Alert.alert("Keluar Aplikasi", "Apakah Anda yakin ingin keluar dari permainan?", [
    {
      text: "Batal",
      onPress: () => null,
      style: "cancel"
    },
    {
      text: "Ya",
      onPress: () => BackHandler.exitApp() // Perintah untuk menutup aplikasi di Android
    }
  ]);
};

  const createnewuser = async () => {
    const db = await getDB();

    try {
      // Contoh data yang akan di-insert
      const userId = "user_tetris_1"; // ID unik sederhana berdasarkan timestamp
      const namaUser = "Player1"; // Anda bisa menggantinya dengan input dari TextInput
      const level = "1";
      const createdAt = new Date().toISOString();
      const skorTerkini = "0";

      // 1. Tentukan interface atau tipe data user
      type UserType = {
        id: string;
        nm_user: string;
        level: string;
        created_at: string;
        score_terkini: string;
        timing: string;
      };

      // 2. Berikan asersi tipe pada hasil getFirstAsync
      let existingUser = await db.getFirstAsync<UserType>(
        `SELECT * FROM t_user WHERE id = ?`,
        [userId]
      );

      // 2. Jika belum ada, baru lakukan INSERT
      if (!existingUser) {
          await db.runAsync(
            `INSERT INTO t_user (id, nm_user, level, created_at, score_terkini) VALUES (?, ?, ?, ?, ?)`,
            [userId, namaUser, level, createdAt, skorTerkini]
          );
          console.log("User baru berhasil ditambahkan ke database.");
          // Ambil data yang baru saja di-insert
          existingUser = { 
            id: userId, 
            nm_user: namaUser,
            level: level,
            created_at: createdAt,
            score_terkini: skorTerkini,
            timing: "1000"
          };
      }
      else {
        await db.runAsync(
          `UPDATE t_user 
          SET score_terkini = ? , level = ?
          WHERE id = ?`, // Perhatikan: pakai 'id', bukan 'id_user'
          [
            0,
            1,
            // Konversi ke string jika kolom score_terkini bertipe TEXT
            userId       // Variabel id user yang sedang aktif
          ]
        );
        
        console.log("User sudah ada di database, melewati proses insert.");

        // 2. Berikan asersi tipe pada hasil getFirstAsync
        // Tambahkan tanda seru (!) di sini untuk memberitahu TypeScript bahwa nilainya TIDAK MUNGKIN null
        existingUser = (await db.getFirstAsync<UserType>(
          `SELECT * FROM t_user WHERE id = ?`,
          [userId]
        ))!;
      }

      // Jalankan query SQL Insert
      /*await db.runAsync(
        `INSERT INTO t_user (id, nm_user, created_at, score_terkini) VALUES (?, ?, ?, ?)`,
        [userId, namaUser, createdAt, skorTerkini]
      );*/

      console.log("Data user baru berhasil disimpan!");
      // Navigasi ke halaman Game sambil membawa data user via parameter (router.navigate)
      router.navigate({
        pathname: '/Game',
        params: {
          userId: existingUser.id,
          userName: existingUser.nm_user,
          score: existingUser.score_terkini,
          level_terkini: existingUser.level,
          timing: "1000"
        },
      });
      //router.navigate('/Game');
    }
    catch (error) {
      console.error("Gagal menyimpan data user:", error);
      // Tetap arahkan ke game atau tangani error sesuai kebutuhan
      router.navigate('/Game');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>welcome to</Text>
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
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={createnewuser}
      >
        <Text style={styles.buttonText}>New Game</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={highscoremodal}
      >
        <Text style={styles.buttonText}>Highscores</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleExitApp}
      >
        <Text style={styles.buttonText}>Quit Game</Text>
      </TouchableOpacity>


      <GameHighScoreModal
              visible={highscoremdl}
              score={sCore}
              level={level}
              userName={nmplayer}
              onHome={handleGoHome}
            />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#232323",
  },
  title: {
    color:'#fff',
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#2196F3",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    elevation: 3, // Shadow untuk Android
    shadowColor: "#000", // Shadow untuk iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginTop:15,
    width:180,
    
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    textAlign:'center'
  },
  titleRow: {
    marginTop:30,
    marginBottom:20,
    flexDirection: 'row',
    alignItems: 'center',
    fontFamily: 'monospace',
  },
  letter: {
    fontSize: 36,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
});