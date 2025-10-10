import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { useThemeColors } from '../../services/Theme';
import { family } from '../../constants/font';
import Shield0 from '../../../assets/ranks/shield0.svg';
import Shield1 from '../../../assets/ranks/shield1.svg';
import Shield2 from '../../../assets/ranks/shield2.svg';
import Shield3 from '../../../assets/ranks/shield3.svg';
import Shield4 from '../../../assets/ranks/shield4.svg';
import Shield5 from '../../../assets/ranks/shield5.svg';
import Shield6 from '../../../assets/ranks/shield6.svg';
import Shield7 from '../../../assets/ranks/shield7.svg';
import Shield8 from '../../../assets/ranks/shield8.svg';
import Shield9 from '../../../assets/ranks/shield9.svg';
import Shield10 from '../../../assets/ranks/shield10.svg';

const shields = [Shield0, Shield1, Shield2, Shield3, Shield4, Shield5, Shield6, Shield7, Shield8, Shield9, Shield10];

// points required to *reach* each rank (example: 0,50,100,...)
const POINTS_PER_RANK = 50;

export default function RankModal({ visible, onClose }) {
  const colors = useThemeColors();
  const { width, height } = useWindowDimensions();
  const panelMaxHeight = Math.floor(height * 0.8);
  const panelWidth = Math.min(520, width - 32);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.backdrop, { backgroundColor: colors.backdrop + 'AA' }]}> 
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.text + '22', maxHeight: panelMaxHeight, width: panelWidth }] }>
          <Text style={[styles.title, { color: colors.text }]}>Níveis</Text>
          <ScrollView contentContainerStyle={styles.list} style={{ maxHeight: panelMaxHeight - 120 }}>
            {shields.map((ShieldComp, idx) => (
              <View key={idx} style={[styles.row, { borderColor: colors.text + '12' }]}>
                <ShieldComp width={64} height={64} />
                <View style={styles.rowText}>
                  <Text style={[styles.rankTitle, { color: colors.text }]}>Nível {idx}</Text>
                  <Text style={[styles.rankSubtitle, { color: colors.text + 'AA' }]}>{idx * POINTS_PER_RANK} pontos necessários</Text>
                </View>
              </View>
            ))}
          </ScrollView>
          <Pressable style={[styles.closeBtn, { borderColor: colors.text + '22' }]} onPress={onClose}>
            <Text style={[styles.closeText, { color: colors.text }]}>Fechar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  panel: { width: '100%', maxWidth: 520, borderRadius: 16, padding: 16, borderWidth: 1 },
  title: { fontSize: 18, fontFamily: family.bold, textAlign: 'center', marginBottom: 12 },
  list: { paddingBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderBottomWidth: 1 },
  rowText: { flex: 1 },
  rankTitle: { fontSize: 16, fontFamily: family.bold },
  rankSubtitle: { fontSize: 13, fontFamily: family.regular, marginTop: 2 },
  closeBtn: { marginTop: 12, paddingVertical: 10, borderWidth: 1, borderRadius: 10, alignItems: 'center' },
  closeText: { fontSize: 15, fontFamily: family.bold },
});
