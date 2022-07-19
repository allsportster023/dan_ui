export enum ValueField {
  DegradedAcquisition = 'degAcq',
  NoAcquisition = 'noAcq',
  DegradedTrack = 'degTrk',
  NoTrack = 'noTrk'
}

export const originalValueColors: Record<ValueField, string> = {
  [ValueField.DegradedAcquisition]: 'rgba(0,255,255,1)',
  [ValueField.DegradedTrack]: 'rgba(0,255,0,1)',
  [ValueField.NoAcquisition]: 'rgba(0,0,255,1)',
  [ValueField.NoTrack]: 'rgba(0,110,0,1)'
};

export const newValueColors: Record<ValueField, string> = {
  [ValueField.DegradedAcquisition]: 'rgba(17,142,171,1)',
  [ValueField.DegradedTrack]: 'rgba(249,160,27,1)',
  [ValueField.NoAcquisition]: 'rgba(14,116,139,1)',
  [ValueField.NoTrack]: 'rgba(214,130,5,1)'
};
