import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useBreakpoint } from '../utils/responsive';

const confirmDestructive = (title, message, onYes) => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`)) onYes();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Continue', style: 'destructive', onPress: onYes },
  ]);
};

const formatCodeInput = (raw) =>
  (raw || '')
    .replace(/[^0-9]/g, '')
    .slice(0, 6)
    .replace(/^(\d{3})(\d{0,3}).*$/, (_, a, b) => (b ? `${a}-${b}` : a));

export const FamilySheet = ({
  visible,
  theme,
  user,
  household,
  inviteCode,
  members,
  isOwner,
  staffCount,
  attendanceDays,
  onRegenerateCode,
  onRemoveMember,
  onJoinFamily,
  onLeaveFamily,
  onClose,
}) => {
  const { isCompact } = useBreakpoint();
  const sheetStyle = isCompact ? styles.bottomSheet : styles.sidePanel;
  const radiusStyle = isCompact ? { borderTopLeftRadius: 12, borderTopRightRadius: 12 } : {};
  const fontFamily = theme.font;

  const [joinOpen, setJoinOpen] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);

  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState('');

  const copyCode = async () => {
    if (!inviteCode) return;
    try {
      if (Platform.OS === 'web' && navigator.clipboard) {
        await navigator.clipboard.writeText(inviteCode);
        setInfo('Code copied to clipboard');
        setTimeout(() => setInfo(''), 2000);
      }
    } catch {
      /* ignore */
    }
  };

  const shareCode = async () => {
    if (!inviteCode) return;
    const message = `👋 You've been invited to join my household on HomeStaff!\n\nUse this code to connect and track attendance together:\n👉 Code: ${inviteCode}`;
    try {
      const url = 'https://homestaff.vercel.app/';
      const title = 'HomeStaff';
      if (Platform.OS === 'web' && navigator.share) {
        await navigator.share({ title, text: message, url });
      } else if (Platform.OS !== 'web') {
        await Share.share({ title, message, url });
      } else {
        await copyCode();
      }
    } catch {
      /* user cancelled or unsupported */
    }
  };

  const handleRegenerate = () => {
    confirmDestructive(
      'Regenerate invite code?',
      'The current code will stop working immediately. You’ll need to share the new code with family members who haven’t joined yet.',
      async () => {
        setBusy(true);
        const res = await onRegenerateCode();
        setBusy(false);
        if (res && res.error) setInfo(res.error);
        else setInfo('New code generated');
        setTimeout(() => setInfo(''), 2500);
      }
    );
  };

  const handleRemove = (m) => {
    confirmDestructive(
      `Remove ${m.email || 'this member'}?`,
      'They will lose access to this household’s data. You can re-invite them with the family code later.',
      async () => {
        setBusy(true);
        const res = await onRemoveMember(m.uid);
        setBusy(false);
        if (res && res.error) setInfo(res.error);
      }
    );
  };

  const handleLeave = () => {
    confirmDestructive(
      'Leave family?',
      'You will be disconnected from this shared household. A fresh empty household will be created for you. This cannot be undone.',
      async () => {
        setBusy(true);
        const res = await onLeaveFamily();
        setBusy(false);
        if (res && res.error) setInfo(res.error);
        else onClose();
      }
    );
  };

  const submitJoin = async () => {
    setJoinError('');
    const code = codeInput.trim();
    if (code.length < 7) {
      setJoinError('Enter the full 6-digit code (e.g. 483-209).');
      return;
    }
    setJoinLoading(true);
    const res = await onJoinFamily(code);
    setJoinLoading(false);
    if (res && res.error) {
      setJoinError(res.error);
      return;
    }
    setJoinOpen(false);
    setCodeInput('');
    setInfo('Joined family successfully');
    setTimeout(() => setInfo(''), 2500);
  };

  const memberCount = members ? members.length : 0;

  return (
    <Modal visible={visible} transparent animationType={isCompact ? 'slide' : 'fade'} onRequestClose={onClose}>
      <Pressable
        style={[styles.backdrop, isCompact ? styles.backdropMobile : styles.backdropDesktop]}
        onPress={onClose}
      >
        <Pressable
          style={[
            sheetStyle,
            radiusStyle,
            { backgroundColor: theme.bg, borderColor: theme.border, boxShadow: `0 4px 16px ${theme.shadowStrong}` },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {isCompact && (
            <View style={styles.handleWrap}>
              <View style={[styles.handleBar, { backgroundColor: theme.separator || theme.border }]} />
            </View>
          )}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.text, fontFamily }]}>Family sharing</Text>
            <Pressable onPress={onClose} hitSlop={10} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
              <Text style={[styles.close, { color: theme.textMuted, fontFamily }]}>✕</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Status */}
            <Text style={[styles.contextLine, { color: theme.textMuted, fontFamily }]}>
              {memberCount > 1
                ? `Sharing with ${memberCount - 1} other ${memberCount === 2 ? 'person' : 'people'}`
                : 'No family members yet. Share the code below to invite someone.'}
            </Text>

            {/* Invite code card */}
            <View style={[styles.codeCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.codeLabel, { color: theme.textMuted, fontFamily }]}>
                Family invite code
              </Text>
              <Text
                style={[styles.codeValue, { color: theme.text, fontFamily }]}
                selectable
              >
                {inviteCode || '— — —'}
              </Text>
              <View style={styles.codeActions}>
                <Pressable
                  onPress={copyCode}
                  style={({ pressed }) => [
                    styles.smallBtn,
                    { borderColor: theme.border, backgroundColor: theme.surfaceAlt, opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <Text style={[styles.smallBtnText, { color: theme.text, fontFamily }]}>Copy</Text>
                </Pressable>
                <Pressable
                  onPress={shareCode}
                  style={({ pressed }) => [
                    styles.smallBtn,
                    { borderColor: theme.border, backgroundColor: theme.surfaceAlt, opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <Text style={[styles.smallBtnText, { color: theme.text, fontFamily }]}>Share</Text>
                </Pressable>
                {isOwner && (
                  <Pressable
                    onPress={handleRegenerate}
                    disabled={busy}
                    style={({ pressed }) => [
                      styles.smallBtn,
                      { borderColor: theme.border, backgroundColor: theme.surfaceAlt, opacity: pressed || busy ? 0.7 : 1 },
                    ]}
                  >
                    <Text style={[styles.smallBtnText, { color: theme.text, fontFamily }]}>
                      Regenerate
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>

            {info ? (
              <Text style={[styles.infoLine, { color: theme.primary, fontFamily }]}>{info}</Text>
            ) : null}

            {/* Members list */}
            <Text style={[styles.sectionLabel, { color: theme.textMuted, fontFamily }]}>
              Members ({memberCount})
            </Text>
            <View style={[styles.membersWrap, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              {members.map((m, idx) => {
                const isLast = idx === members.length - 1;
                return (
                  <View
                    key={m.uid}
                    style={[
                      styles.memberRow,
                      !isLast && { borderBottomWidth: 1, borderBottomColor: theme.separator || theme.border },
                    ]}
                  >
                    <View style={styles.memberInfo}>
                      <Text style={[styles.memberEmail, { color: theme.text, fontFamily }]} numberOfLines={1}>
                        {m.email || 'Unknown'}
                      </Text>
                      <View style={styles.memberMeta}>
                        <Text
                          style={[
                            styles.roleTag,
                            {
                              color: m.role === 'owner' ? theme.primary : theme.textMuted,
                              backgroundColor: m.role === 'owner' ? theme.primary + '22' : theme.surfaceAlt,
                              fontFamily,
                            },
                          ]}
                        >
                          {m.role || 'member'}
                        </Text>
                        {m.isYou && (
                          <Text style={[styles.youTag, { color: theme.textSubtle, fontFamily }]}>you</Text>
                        )}
                      </View>
                    </View>
                    {isOwner && !m.isYou && (
                      <Pressable
                        onPress={() => handleRemove(m)}
                        disabled={busy}
                        style={({ pressed }) => [styles.removeBtn, pressed && { opacity: 0.6 }]}
                        hitSlop={6}
                      >
                        <Text style={[styles.removeBtnText, { color: theme.danger, fontFamily }]}>Remove</Text>
                      </Pressable>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Join another family */}
            <View style={[styles.joinSection, { borderTopColor: theme.separator || theme.border }]}>
              <Text style={[styles.sectionLabel, { color: theme.textMuted, fontFamily }]}>
                Join another family
              </Text>
              <Text style={[styles.helper, { color: theme.textSubtle, fontFamily }]}>
                Got a code from someone else? Use it to join their household. Your current data ({staffCount} {staffCount === 1 ? 'staff' : 'staff'}, {attendanceDays} {attendanceDays === 1 ? 'attendance day' : 'attendance days'}) will be archived if you’re the only member here.
              </Text>
              <Pressable
                onPress={() => setJoinOpen(true)}
                style={({ pressed }) => [
                  styles.joinBtn,
                  { borderColor: theme.primary, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={[styles.joinBtnText, { color: theme.primary, fontFamily }]}>
                  Enter family code
                </Text>
              </Pressable>
            </View>

            {/* Leave family (only useful when there's more than one member) */}
            {memberCount > 1 && (
              <Pressable
                onPress={handleLeave}
                disabled={busy}
                style={({ pressed }) => [
                  styles.leaveBtn,
                  { borderColor: 'rgba(239, 68, 68, 0.4)', backgroundColor: 'rgba(239, 68, 68, 0.08)', opacity: pressed || busy ? 0.7 : 1 },
                ]}
              >
                <Text style={[styles.leaveBtnText, { color: theme.danger, fontFamily }]}>
                  Leave family
                </Text>
                <Text style={[styles.leaveBtnSub, { color: theme.textMuted, fontFamily }]}>
                  Disconnect from this shared household
                </Text>
              </Pressable>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>

      {/* Join modal */}
      <Modal visible={joinOpen} transparent animationType="fade" onRequestClose={() => !joinLoading && setJoinOpen(false)}>
        <Pressable style={styles.confirmBackdrop} onPress={() => !joinLoading && setJoinOpen(false)}>
          <Pressable
            style={[styles.confirmCard, { backgroundColor: theme.bg, borderColor: theme.border }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.confirmTitle, { color: theme.text, fontFamily }]}>
              Join a family
            </Text>
            <Text style={[styles.confirmBody, { color: theme.textMuted, fontFamily }]}>
              Enter the 6-digit family code you received. Your current household will be archived for 30 days if you’re the only member.
            </Text>
            <TextInput
              style={[
                styles.codeInput,
                { color: theme.text, backgroundColor: theme.surfaceAlt, borderColor: theme.border, fontFamily },
              ]}
              value={codeInput}
              onChangeText={(t) => { setCodeInput(formatCodeInput(t)); setJoinError(''); }}
              placeholder="483-209"
              placeholderTextColor={theme.textSubtle}
              keyboardType="number-pad"
              inputMode="numeric"
              autoFocus
              maxLength={7}
            />
            {joinError ? (
              <Text style={[styles.confirmError, { fontFamily }]}>{joinError}</Text>
            ) : null}
            <View style={styles.confirmActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.confirmBtn,
                  { borderColor: theme.border, backgroundColor: theme.surfaceAlt, opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => { setJoinOpen(false); setCodeInput(''); setJoinError(''); }}
                disabled={joinLoading}
              >
                <Text style={[styles.confirmBtnText, { color: theme.text, fontFamily }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.confirmBtn,
                  { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 },
                ]}
                onPress={submitJoin}
                disabled={joinLoading || codeInput.length < 7}
              >
                {joinLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={[styles.confirmBtnText, { color: '#fff', fontFamily }]}>Join</Text>
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
  },
  sidePanel: {
    width: 380,
    maxWidth: '100%',
    height: '100%',
    borderLeftWidth: 1,
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
  title: { fontSize: 15, fontWeight: '700', letterSpacing: -0.1 },
  close: { fontSize: 16, fontWeight: '500' },
  scroll: { padding: 16, paddingBottom: 40 },
  contextLine: { fontSize: 13, marginBottom: 14, paddingHorizontal: 4 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 4,
    marginTop: 18,
    marginBottom: 8,
  },
  codeCard: { padding: 18, borderRadius: 14, borderWidth: 1, alignItems: 'center', marginTop: 4 },
  codeLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  codeValue: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 4,
    fontVariant: ['tabular-nums'],
  },
  codeActions: { flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' },
  smallBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  smallBtnText: { fontSize: 12, fontWeight: '600' },
  infoLine: { fontSize: 12, textAlign: 'center', marginTop: 8, fontWeight: '600' },
  membersWrap: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  memberInfo: { flex: 1, gap: 4 },
  memberEmail: { fontSize: 14, fontWeight: '600' },
  memberMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  roleTag: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  youTag: { fontSize: 10, fontWeight: '600' },
  removeBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  removeBtnText: { fontSize: 12, fontWeight: '600' },
  joinSection: { marginTop: 24, paddingTop: 16, borderTopWidth: 1 },
  helper: { fontSize: 12, lineHeight: 17, paddingHorizontal: 4, marginBottom: 10, opacity: 0.85 },
  joinBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  joinBtnText: { fontSize: 13, fontWeight: '700' },
  leaveBtn: {
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  leaveBtnText: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  leaveBtnSub: { fontSize: 10, opacity: 0.8 },

  confirmBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  confirmCard: { width: '100%', maxWidth: 380, padding: 22, borderRadius: 16, borderWidth: 1 },
  confirmTitle: { fontSize: 17, fontWeight: '700', marginBottom: 8 },
  confirmBody: { fontSize: 13, lineHeight: 19, marginBottom: 14 },
  codeInput: {
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 4,
    textAlign: 'center',
    borderWidth: 1,
  },
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
  confirmBtnText: { fontSize: 14, fontWeight: '700' },
});
