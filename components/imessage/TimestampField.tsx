import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

type Props = {
  value: Date | null;
  onChange: (d: Date | null) => void;
  label?: string;
  autoText?: string;
};

/**
 * Clear Date + Time fields for choosing a message's absolute timestamp.
 * When value is null the caller applies its own default (e.g. +1 min).
 */
export default function TimestampField({
  value,
  onChange,
  label = 'Timestamp:',
  autoText = 'Auto',
}: Props) {
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  const current = value ?? new Date();

  const dateLabel = value
    ? value.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : autoText;
  const timeLabel = value
    ? value.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    : autoText;

  const applyDatePart = (picked: Date) => {
    const d = new Date(current);
    d.setFullYear(picked.getFullYear(), picked.getMonth(), picked.getDate());
    onChange(d);
  };
  const applyTimePart = (picked: Date) => {
    const d = new Date(current);
    d.setHours(picked.getHours(), picked.getMinutes(), 0, 0);
    onChange(d);
  };

  return (
    <View>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>

        <Pressable style={styles.field} onPress={() => setShowDate((s) => !s)}>
          <Text style={styles.fieldLabel}>Date</Text>
          <Text style={styles.fieldValue}>{dateLabel}</Text>
        </Pressable>

        <Pressable style={styles.field} onPress={() => setShowTime((s) => !s)}>
          <Text style={styles.fieldLabel}>Time</Text>
          <Text style={styles.fieldValue}>{timeLabel}</Text>
        </Pressable>

        {value ? (
          <Pressable style={styles.clear} onPress={() => onChange(null)}>
            <Text style={styles.clearText}>Auto</Text>
          </Pressable>
        ) : null}

        {(showDate || showTime) && (
          <Pressable
            style={styles.done}
            onPress={() => {
              setShowDate(false);
              setShowTime(false);
            }}
          >
            <Text style={styles.doneText}>Done</Text>
          </Pressable>
        )}
      </View>

      {showDate && (
        <View style={styles.pickerWrap}>
          <DateTimePicker
            value={current}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(_e, d) => {
              if (Platform.OS !== 'ios') setShowDate(false);
              if (d) applyDatePart(d);
            }}
          />
        </View>
      )}
      {showTime && (
        <View style={styles.pickerWrap}>
          <DateTimePicker
            value={current}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_e, d) => {
              if (Platform.OS !== 'ios') setShowTime(false);
              if (d) applyTimePart(d);
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  label: { fontSize: 13, color: '#555', marginRight: 10 },
  field: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  fieldLabel: { fontSize: 10, color: '#8E8E93' },
  fieldValue: { fontSize: 14, color: '#000' },
  clear: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  clearText: { color: '#007AFF', fontWeight: '600', fontSize: 13 },
  done: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 6,
    marginLeft: 4,
  },
  doneText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  pickerWrap: {
    marginTop: 6,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
});
