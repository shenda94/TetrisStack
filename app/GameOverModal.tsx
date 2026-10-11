import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal } from 'react-native';

interface GameOverModalProps {
  visible: boolean;
  score: number;
  userName: string;
  onRestart: () => void;
  onHome: () => void;
}

export default function GameOverModal({
  visible,
  score,
  userName,
  onRestart,
  onHome,
}: GameOverModalProps) {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onRestart}
    >
      <View style={styles.overlay}>
        <View style={styles.dialogContainer}>
          {/* Judul Game Over */}
          <Text style={styles.title}>GAME OVER</Text>
          <Text style={styles.subtitle}>Don't lose hope!</Text>

          {/* Info Player & Skor Akhir */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>Player: <Text style={styles.highlight}>{userName || "Player"}</Text></Text>
            <Text style={styles.infoText}>Skor Akhir:</Text>
            <Text style={styles.scoreValue}>{score}</Text>
          </View>

          {/* Tombol Aksi */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.btn, styles.restartBtn]} onPress={onRestart}>
              <Text style={styles.btnText}>MAIN LAGI</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btn, styles.homeBtn]} onPress={onHome}>
              <Text style={styles.btnText}>MENU UTAMA</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)', // Efek gelap transparan di background
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialogContainer: {
    width: '85%',
    maxWidth: 320,
    backgroundColor: '#1E232A',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#3A4252',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  title: {
    color: '#E63946', // Warna merah khas game over
    fontSize: 26,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 2,
    marginBottom: 6,
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'monospace',
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#171B20',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2A303C',
  },
  infoText: {
    color: '#D4A373',
    fontSize: 14,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  highlight: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  scoreValue: {
    color: '#22C55E',
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginTop: 4,
  },
  buttonContainer: {
    width: '100%',
    gap: 10,
  },
  btn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderBottomWidth: 5,
  },
  restartBtn: {
    backgroundColor: '#22C55E',
    borderColor: '#4ADE80',
  },
  homeBtn: {
    backgroundColor: '#2A303C',
    borderColor: '#3A4252',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
});