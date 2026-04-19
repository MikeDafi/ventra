import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as FileSystem from 'expo-file-system/legacy';
import { GROUPON_FOLDER, VOUCHER_FIELDS, Voucher } from '@/constants/groupon';

export default function GrouponForm() {
  const router = useRouter();
  const routeParams = useLocalSearchParams();
  const existingPayload = routeParams.voucherPayload
    ? (JSON.parse(routeParams.voucherPayload as string) as Voucher)
    : null;
  const existingFileName = routeParams.fileName as string | undefined;

  const [formValues, setFormValues] = useState<Record<string, string>>(() => {
    if (existingPayload) {
      const vals: Record<string, string> = {};
      VOUCHER_FIELDS.forEach(({ key }) => {
        vals[key] = (existingPayload as any)[key] || '';
      });
      return vals;
    }
    const vals: Record<string, string> = {};
    VOUCHER_FIELDS.forEach(({ key, default: def }) => {
      vals[key] = def || '';
    });
    return vals;
  });

  const handleChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const buildVoucher = (): Voucher => {
    const id = existingPayload?.id || `voucher-${Date.now()}`;
    return {
      id,
      title: formValues.title || '',
      location: formValues.location || '',
      countCurrent: existingPayload?.countCurrent || 1,
      countTotal: existingPayload?.countTotal || 1,
      hasBarcode: existingPayload?.hasBarcode ?? true,
      redemptionCode: formValues.redemptionCode || '',
      grouponCode: formValues.grouponCode || '',
      originalPrice: formValues.originalPrice || '',
      grouponPrice: formValues.grouponPrice || '',
      promoDiscount: formValues.promoDiscount || '',
      amountPaid: formValues.amountPaid || '',
      expires: formValues.expires || '',
      redeemedDate: existingPayload?.redeemedDate || null,
      customerName: formValues.customerName || '',
    };
  };

  const handlePreview = () => {
    const voucher = buildVoucher();
    router.push({
      pathname: '/subapps/groupon/viewer',
      params: { previewPayload: JSON.stringify(voucher) },
    });
  };

  const handleSave = async () => {
    const folderInfo = await FileSystem.getInfoAsync(GROUPON_FOLDER);
    if (!folderInfo.exists) {
      await FileSystem.makeDirectoryAsync(GROUPON_FOLDER, { intermediates: true });
    }

    const voucher = buildVoucher();
    const fileName = existingFileName || `${voucher.id}.json`;
    const filePath = `${GROUPON_FOLDER}${fileName}`;
    await FileSystem.writeAsStringAsync(filePath, JSON.stringify(voucher, null, 2));
    Alert.alert('Saved!', existingPayload ? 'Voucher updated.' : 'Voucher created.');
    router.back();
  };

  return (
    <View style={{ flex: 1, paddingTop: 80, backgroundColor: '#fff' }}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Cancel</Text>
        </Pressable>
        <Text style={styles.screenTitle}>
          {existingPayload ? 'Edit Voucher' : 'New Voucher'}
        </Text>
        <View style={styles.headerActions}>
          <Pressable style={styles.previewBtn} onPress={handlePreview}>
            <Text style={styles.previewBtnText}>Preview</Text>
          </Pressable>
          <Pressable style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save</Text>
          </Pressable>
        </View>
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={styles.form}
        extraScrollHeight={200}
        enableOnAndroid
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          {VOUCHER_FIELDS.map(({ label, key, example }) => (
            <View key={key} style={styles.inputGroup}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={styles.input}
                value={formValues[key] || ''}
                onChangeText={(text) => handleChange(key, text)}
                placeholder={example || label}
                placeholderTextColor="#bbb"
              />
            </View>
          ))}
        </ScrollView>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  screenTitle: { fontSize: 17, fontWeight: '700' },
  backBtn: { padding: 8 },
  backBtnText: { color: '#3d7a2a', fontSize: 16 },
  headerActions: { flexDirection: 'row', gap: 8 },
  previewBtn: {
    backgroundColor: '#3366FF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  previewBtnText: { color: '#fff', fontWeight: '700' },
  saveBtn: {
    backgroundColor: '#3d7a2a',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  saveBtnText: { color: '#fff', fontWeight: '700' },
  form: { padding: 20, paddingBottom: 100 },
  inputGroup: { marginBottom: 16 },
  label: { fontWeight: '600', marginBottom: 4, color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    borderRadius: 8,
    fontSize: 15,
  },
});
