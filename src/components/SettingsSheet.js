import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { CategoryEditor } from './CategoryEditor';
import { useBreakpoint } from '../utils/responsive';

const confirmTwoStep = (title, message, onYes) => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`)) onYes();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Continue', style: 'destructive', onPress: onYes },
  ]);
};

export const SettingsSheet = ({
  visible,
  theme,
  categories,
  syncStatus,
  userEmail,
  activeStaffName,
  memberCount,
  onOpenFamily,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onSignOut,
  onDeleteAccount,
  onClose,
}) => {
  const { isCompact } = useBreakpoint();
  const sheetStyle = isCompact ? styles.bottomSheet : styles.sidePanel;
  const radiusStyle = isCompact
    ? { borderTopLeftRadius: 12, borderTopRightRadius: 12 }
    : {};
  const fontFamily = theme.font;

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleSignOut = () => {
    confirmTwoStep('Sign out?', 'Your data stays in the cloud. Sign back in any time.', onSignOut);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    const res = await onDeleteAccount(deletePassword);
    setDeleting(false);
    if (res && res.error) {
      setDeleteError(res.error);
      return;
    }
    setDeleteOpen(false);
    setDeletePassword('');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType={isCompact ? 'slide' : 'fade'}
      onRequestClose={onClose}
    >
      <Pressable
        style={[styles.backdrop, isCompact ? styles.backdropMobile : styles.backdropDesktop]}
        onPress={onClose}
      >
        <Pressable
          style={[
            sheetStyle,
            radiusStyle,
            {
              backgroundColor: theme.bg,
              borderColor: theme.border,
              boxShadow: `0 4px 16px ${theme.shadowStrong}`,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {isCompact && (
            <View style={styles.handleWrap}>
              <View style={[styles.handleBar, { backgroundColor: theme.separator || theme.border }]} />
            </View>
          )}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.text, fontFamily }]}>Settings</Text>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              style={({ pressed, hovered }) => [
                styles.closeBtn,
                hovered && { backgroundColor: theme.surfaceHover },
                pressed && { opacity: 0.6 },
              ]}
            >
              <Text style={[styles.close, { color: theme.textMuted, fontFamily }]}>✕</Text>
            </Pressable>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            {activeStaffName && (
              <Text style={[styles.contextLabel, { color: theme.textMuted, fontFamily }]}>
                Categories for{' '}
                <Text style={{ color: theme.text, fontWeight: '700' }}>{activeStaffName}</Text>
              </Text>
            )}

            <Text style={[styles.sectionLabel, { color: theme.textMuted, fontFamily }]}>
              Categories & rates
            </Text>
            <CategoryEditor
              categories={categories}
              theme={theme}
              onUpdate={onUpdateCategory}
              onDelete={onDeleteCategory}
              onAdd={onAddCategory}
            />

            {/* Family sharing row */}
            <Pressable
              onPress={onOpenFamily}
              style={({ pressed, hovered }) => [
                styles.familyRow,
                { backgroundColor: theme.surface, borderColor: theme.border },
                hovered && { backgroundColor: theme.surfaceHover },
                pressed && { opacity: 0.7 },
              ]}
            >
              <View style={styles.familyRowLeft}>
                <Text style={styles.familyRowIcon}>👨‍👩‍👧</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.familyRowTitle, { color: theme.text, fontFamily }]}>
                    Family sharing
                  </Text>
                  <Text style={[styles.familyRowSub, { color: theme.textMuted, fontFamily }]}>
                    {memberCount && memberCount > 1
                      ? `Sharing with ${memberCount - 1} other ${memberCount === 2 ? 'person' : 'people'}`
                      : 'Invite family to see the same data'}
                  </Text>
                </View>
              </View>
              <Text style={[styles.chevron, { color: theme.textMuted, fontFamily }]}>›</Text>
            </Pressable>

            <View style={[styles.accountSection, { borderTopColor: theme.separator || theme.border }]}>
              <View style={styles.syncInfo}>
                <View
                  style={[
                    styles.syncDot,
                    {
                      backgroundColor:
                        syncStatus === 'synced' ? '#10B981' :
                        syncStatus === 'syncing' ? '#F59E0B' : '#EF4444',
                    },
                  ]}
                />
                <Text style={[styles.syncText, { color: theme.textMuted, fontFamily }]}>
                  {syncStatus === 'synced' ? 'Cloud Synced' :
                   syncStatus === 'syncing' ? 'Syncing…' : 'Sync error'}
                </Text>
              </View>

              {userEmail && (
                <Text style={[styles.emailText, { color: theme.textSubtle, fontFamily }]}>
                  {userEmail}
                </Text>
              )}

              <View style={{ height: 12 }} />

              <Pressable
                style={({ pressed }) => [
                  styles.outlineButton,
                  { borderColor: theme.border, backgroundColor: theme.surfaceAlt, opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={handleSignOut}
              >
                <Text style={[styles.outlineButtonText, { color: theme.text, fontFamily }]}>Sign out</Text>
              </Pressable>

              <View style={{ height: 8 }} />

              <Pressable
                style={({ pressed }) => [
                  styles.dangerButton,
                  { borderColor: 'rgba(239, 68, 68, 0.4)', backgroundColor: 'rgba(239, 68, 68, 0.08)', opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => setDeleteOpen(true)}
              >
                <Text style={[styles.dangerButtonText, { color: theme.danger, fontFamily }]}>
                  Delete account
                </Text>
                <Text style={[styles.dangerButtonSub, { color: theme.textMuted, fontFamily }]}>
                  Permanently erases your account and all staff data
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>

      <Modal visible={deleteOpen} transparent animationType="fade" onRequestClose={() => setDeleteOpen(false)}>
        <Pressable style={styles.confirmBackdrop} onPress={() => !deleting && setDeleteOpen(false)}>
          <Pressable
            style={[styles.confirmCard, { backgroundColor: theme.bg, borderColor: theme.border }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.confirmTitle, { color: theme.text, fontFamily }]}>
              Delete your account?
            </Text>
            <Text style={[styles.confirmBody, { color: theme.textMuted, fontFamily }]}>
              This permanently erases your account, all staff members, attendance, and rates. This cannot be undone.
            </Text>
            <Text style={[styles.confirmLabel, { color: theme.textMuted, fontFamily }]}>
              Re-enter your password to confirm
            </Text>
            <TextInput
              style={[
                styles.confirmInput,
                { color: theme.text, backgroundColor: theme.surfaceAlt, borderColor: theme.border, fontFamily },
              ]}
              value={deletePassword}
              onChangeText={(t) => { setDeletePassword(t); setDeleteError(''); }}
              secureTextEntry
              autoCapitalize="none"
              placeholder="Password"
              placeholderTextColor={theme.textSubtle}
            />
            {deleteError ? (
              <Text style={[styles.confirmError, { fontFamily }]}>{deleteError}</Text>
            ) : null}
            <View style={styles.confirmActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.confirmBtn,
                  { borderColor: theme.border, backgroundColor: theme.surfaceAlt, opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => { setDeleteOpen(false); setDeletePassword(''); setDeleteError(''); }}
                disabled={deleting}
              >
                <Text style={[styles.confirmBtnText, { color: theme.text, fontFamily }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.confirmBtn,
                  styles.confirmBtnDanger,
                  { backgroundColor: theme.danger, opacity: pressed ? 0.85 : 1 },
                ]}
                onPress={handleConfirmDelete}
                disabled={deleting || !deletePassword}
              >
                {deleting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={[styles.confirmBtnText, { color: '#fff', fontFamily }]}>
                    Delete forever
                  </Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(30, 30, 30, 0.35)' },
  backdropMobile: { justifyContent: 'flex-end' },
  backdropDesktop: { alignItems: 'flex-end' },
  bottomSheet: {
    width: '100%',
    maxHeight: '94%',
    minHeight: '60%',
    borderTopWidth: 1,
    boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.1)',
    elevation: 12,
  },
  sidePanel: {
    width: 380,
    maxWidth: '100%',
    height: '100%',
    borderLeftWidth: 1,
    boxShadow: '-4px 0 16px rgba(0, 0, 0, 0.1)',
    elevation: 12,
  },
  handleWrap: { alignItems: 'center', paddingVertical: 8 },
  handleBar: { width: 36, height: 4, borderRadius: 2 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  title: { fontSize: 14, fontWeight: '600', letterSpacing: -0.1 },
  closeBtn: { width: 26, height: 26, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  close: { fontSize: 14, fontWeight: '500' },
  scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 30 },
  contextLabel: { fontSize: 12, marginBottom: 16, paddingHorizontal: 4 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginLeft: 4,
    marginBottom: 8,
  },
  familyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 24,
  },
  familyRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  familyRowIcon: { fontSize: 22 },
  familyRowTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  familyRowSub: { fontSize: 11, opacity: 0.85 },
  chevron: { fontSize: 20, fontWeight: '400', opacity: 0.6 },
  accountSection: { marginTop: 24, paddingTop: 16, borderTopWidth: 1 },
  syncInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' },
  syncDot: { width: 6, height: 6, borderRadius: 3 },
  syncText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.2 },
  emailText: { fontSize: 11, textAlign: 'center', marginTop: 6, opacity: 0.85 },
  outlineButton: {
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: { fontSize: 13, fontWeight: '600' },
  dangerButton: {
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButtonText: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  dangerButtonSub: { fontSize: 10, opacity: 0.8, textAlign: 'center', paddingHorizontal: 10 },

  confirmBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  confirmCard: { width: '100%', maxWidth: 380, padding: 22, borderRadius: 16, borderWidth: 1 },
  confirmTitle: { fontSize: 17, fontWeight: '700', marginBottom: 8 },
  confirmBody: { fontSize: 13, lineHeight: 19, marginBottom: 16 },
  confirmLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 },
  confirmInput: { height: 44, borderRadius: 10, paddingHorizontal: 12, fontSize: 14, borderWidth: 1 },
  confirmError: { color: '#EF4444', fontSize: 12, marginTop: 8 },
  confirmActions: { flexDirection: 'row', gap: 8, marginTop: 16 },
  confirmBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnDanger: { borderColor: 'transparent' },
  confirmBtnText: { fontSize: 14, fontWeight: '700' },
});
