// Support & Help screen with FAQ section and social media links

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const FAQS: FAQ[] = [
  {
    id: '1',
    question: 'How do I track my eco-driving score?',
    answer: 'Your eco-driving score is automatically calculated based on your driving habits. You can view it on the Home screen and in your Profile under Stats. The score considers factors like smooth acceleration, efficient braking, and optimal speed maintenance.',
  },
  {
    id: '2',
    question: 'How do I create or join a group?',
    answer: 'To create a group, go to the Groups tab and tap the "+" button. To join an existing group, browse the suggested groups or search for a specific group name, then tap "Join".',
  },
  {
    id: '3',
    question: 'How do I set and track my goals?',
    answer: 'Navigate to the Groups tab and select the "Goals" section. Tap "Add Goal" to create a new personal goal. You can choose from predefined tasks or create custom ones. Track your progress in real-time on the Home screen.',
  },
  {
    id: '4',
    question: 'How do I manage notifications?',
    answer: 'To manage notifications, go to "Settings," select "Notification Settings," and customize your preferences. You can enable or disable notifications for goals, groups, and achievements.',
  },
  {
    id: '5',
    question: 'How do I connect my car to the app?',
    answer: 'Go to Profile > Connect Car. Make sure your car supports Bluetooth connectivity. Follow the on-screen instructions to pair your vehicle with the app for automatic trip tracking.',
  },
  {
    id: '6',
    question: 'How do I view my trip history?',
    answer: 'Your most recent trip is displayed on the Home screen. For a complete trip history with detailed statistics, navigate to the Stats tab where you can review all your past journeys.',
  },
  {
    id: '7',
    question: 'What are the benefits of group challenges?',
    answer: 'Group challenges allow you to compete with friends and other eco-drivers. They help motivate you to improve your driving habits while earning rewards and climbing the leaderboard.',
  },
  {
    id: '8',
    question: 'How is my driving data used?',
    answer: 'Your driving data is used solely to provide personalized insights and improve your eco-driving score. We prioritize your privacy and never share your data without consent. For more details, check our Privacy Policy in Terms & Conditions.',
  },
];

interface SocialMediaItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}

function SocialMediaItem({ icon, label, onPress }: SocialMediaItemProps) {
  return (
    <TouchableOpacity style={styles.socialItem} onPress={onPress}>
      <View style={styles.socialIconContainer}>
        <Ionicons name={icon} size={24} color="#fff" />
      </View>
      <Text style={styles.socialLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color="#5ca990" />
    </TouchableOpacity>
  );
}

interface FAQItemProps {
  faq: FAQ;
  isExpanded: boolean;
  onToggle: () => void;
}

function FAQItem({ faq, isExpanded, onToggle }: FAQItemProps) {
  return (
    <TouchableOpacity
      style={[styles.faqItem, isExpanded && styles.faqItemExpanded]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{faq.question}</Text>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-forward'}
          size={20}
          color="#5ca990"
        />
      </View>
      {isExpanded && (
        <View style={styles.faqAnswerContainer}>
          <Text style={styles.faqAnswer}>{faq.answer}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function SupportHelp() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'contactUs' | 'faq'>('faq');

  const filteredFAQs = FAQS.filter((faq) =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSocialPress = (platform: string) => {
    const urls: Record<string, string> = {
      email: 'mailto:email@eko.app',
      facebook: 'https://facebook.com/ekoapp',
      twitter: 'https://twitter.com/ekoapp',
      instagram: 'https://instagram.com/ekoapp',
      whatsapp: 'https://wa.me/35190000000000',
    };

    const url = urls[platform];
    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', `Could not open ${platform}`);
      });
    }
  };

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#f5f5f5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'contactUs' && styles.tabActive]}
            onPress={() => setActiveTab('contactUs')}
          >
            <Text style={[styles.tabText, activeTab === 'contactUs' && styles.tabTextActive]}>
              Contact Us
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'faq' && styles.tabActive]}
            onPress={() => setActiveTab('faq')}
          >
            <Text style={[styles.tabText, activeTab === 'faq' && styles.tabTextActive]}>
              FAQ
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'contactUs' ? (
          /* Contact Us Section */
          <View style={styles.section}>
            <View style={styles.socialSection}>
              <SocialMediaItem
                icon="mail-outline"
                label="Email"
                onPress={() => handleSocialPress('email')}
              />
              <SocialMediaItem
                icon="logo-facebook"
                label="FaceBook"
                onPress={() => handleSocialPress('facebook')}
              />
              <SocialMediaItem
                icon="logo-twitter"
                label="Twitter"
                onPress={() => handleSocialPress('twitter')}
              />
              <SocialMediaItem
                icon="logo-instagram"
                label="Instagram"
                onPress={() => handleSocialPress('instagram')}
              />
              <SocialMediaItem
                icon="logo-whatsapp"
                label="WhatsApp"
                onPress={() => handleSocialPress('whatsapp')}
              />
            </View>
          </View>
        ) : (
          /* FAQ Section */
          <>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>

            {/* FAQ List */}
            <View style={styles.faqSection}>
              {filteredFAQs.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="help-circle-outline" size={48} color="#666" />
                  <Text style={styles.emptyText}>No FAQs found</Text>
                  <Text style={styles.emptySubtext}>Try a different search term</Text>
                </View>
              ) : (
                filteredFAQs.map((faq) => (
                  <FAQItem
                    key={faq.id}
                    faq={faq}
                    isExpanded={expandedFAQ === faq.id}
                    onToggle={() => toggleFAQ(faq.id)}
                  />
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e0d',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(214, 214, 214, 0.1)',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#f5f5f5',
  },
  placeholder: {
    width: 36,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 24,
    backgroundColor: 'rgba(26, 26, 26, 0.85)',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#5ca990',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
  },
  tabTextActive: {
    color: '#fff',
  },
  section: {
    marginHorizontal: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 26, 26, 0.85)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(214, 214, 214, 0.2)',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#f5f5f5',
  },
  socialSection: {
    backgroundColor: 'rgba(26, 26, 26, 0.85)',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(214, 214, 214, 0.2)',
    overflow: 'hidden',
  },
  socialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(214, 214, 214, 0.1)',
  },
  socialIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#5ca990',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  socialLabel: {
    flex: 1,
    fontSize: 16,
    color: '#f5f5f5',
    fontWeight: '500',
  },
  faqSection: {
    marginHorizontal: 24,
    gap: 12,
  },
  faqItem: {
    backgroundColor: 'rgba(26, 26, 26, 0.85)',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(214, 214, 214, 0.2)',
    overflow: 'hidden',
  },
  faqItemExpanded: {
    borderColor: '#5ca990',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#f5f5f5',
    marginRight: 12,
  },
  faqAnswerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 22,
    color: '#ccc',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f5f5f5',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});