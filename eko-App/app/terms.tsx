// Terms and Conditions screen displaying legal agreements and policies

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TermsAndConditions() {
  const router = useRouter();

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#f5f5f5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Agreement Header */}
        <View style={styles.agreementSection}>
          <Text style={styles.agreementLabel}>AGREEMENT</Text>
          <Text style={styles.mainTitle}>Terms of Service</Text>
          <Text style={styles.lastUpdated}>Last updated on 28/10/2025</Text>
        </View>

        {/* Clause 1 */}
        <View style={styles.clause}>
          <Text style={styles.clauseTitle}>Clause 1: Acceptance of Terms</Text>
          <Text style={styles.clauseText}>
            By creating an account or using the Eco-Driving service, you confirm that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree with any part of these terms, you must immediately discontinue your use of the App.
          </Text>
        </View>

        {/* Clause 2 */}
        <View style={styles.clause}>
          <Text style={styles.clauseTitle}>Clause 2: Description of Service</Text>
          <Text style={styles.clauseText}>
            The Eco-Driving App is a mobile application designed to help users drive more sustainably and efficiently, reduce environmental impact, and improve safety. The Service includes goal setting, progress tracking, group challenges, and communication features to connect with groups.
          </Text>
        </View>

        {/* Clause 3 */}
        <View style={styles.clause}>
          <Text style={styles.clauseTitle}>Clause 3: User Account and Data</Text>
          <Text style={styles.clauseText}>
            You are responsible for maintaining the confidentiality of your account credentials. You grant Eco-Driving a limited license to collect, process, use, and share your driving data (including trips, fuel consumption) solely to provide and improve the Service. Some features, such as reviewing your eco-driving score and statistics, require location access, as described in our Privacy Policy.
          </Text>
        </View>

        {/* Clause 4 */}
        <View style={styles.clause}>
          <Text style={styles.clauseTitle}>Clause 4: Acceptable Use and Conduct</Text>
          <Text style={styles.clauseText}>
            You agree not to use the Service for any unlawful purpose or in any way that could damage the App or its users. This includes, but is not limited to: manipulating driving scores or data, using offensive language in communication features for harassment, spamming, or sharing malicious content. You must comply with all applicable traffic laws and safe driving practices and never interact with the App while actively driving.
          </Text>
        </View>

        {/* Clause 5 */}
        <View style={styles.clause}>
          <Text style={styles.clauseTitle}>Clause 5: Intellectual Property Rights</Text>
          <Text style={styles.clauseText}>
            All text, graphics, logos, and content related to the Eco-Driving App, including its software, design, features, and all content provided by us, remain the exclusive property of Eco-Driving. You may not copy, modify, or reverse-engineer any part of the App.
          </Text>
        </View>

        {/* Clause 6 */}
        <View style={styles.clause}>
          <Text style={styles.clauseTitle}>Clause 6: Disclaimers and Limitation of Liability</Text>
          <Text style={styles.clauseText}>
            The Eco-Driving Service is provided "as is" and "as available." We do not guarantee uninterrupted, error-free, or completely secure service. Driving data, trip statistics, and scores are for informational purposes only and are not a substitute for safe driving judgment. Under no circumstances shall Eco-Driving be liable for any indirect, incidental, or consequential damages arising from your use of the App.
          </Text>
        </View>

        {/* Clause 7 */}
        <View style={styles.clause}>
          <Text style={styles.clauseTitle}>Clause 7: Termination</Text>
          <Text style={styles.clauseText}>
            We may suspend or terminate your access to the Service at our sole discretion, with or without notice, for conduct we believe violates these Terms, harms other App users, us, or third parties. You may terminate your account at any time through the App settings.
          </Text>
        </View>

        {/* Clause 8 */}
        <View style={styles.clause}>
          <Text style={styles.clauseTitle}>Clause 8: Modifications to Terms</Text>
          <Text style={styles.clauseText}>
            We reserve the right to modify or update these Terms at any time. We will provide notice of material changes via the App or via email. Your continued use of the Service after such changes constitutes your acceptance of the new Terms.
          </Text>
        </View>

        {/* Clause 9 */}
        <View style={styles.clause}>
          <Text style={styles.clauseTitle}>Clause 9: Governing Law and Dispute Resolution</Text>
          <Text style={styles.clauseText}>
            These Terms shall be governed by the laws of Portugal, excluding its conflict-of-law provisions. Any disputes arising from or relating to these Terms shall first be attempted to be resolved through good-faith negotiations. If unresolved, they shall be subject to the exclusive jurisdiction of the courts located in Portugal.
          </Text>
        </View>

        {/* Clause 10 */}
        <View style={styles.clause}>
          <Text style={styles.clauseTitle}>Clause 10: Contact Information</Text>
          <Text style={styles.clauseText}>
            For any questions about these Terms of Service or other inquiries, please contact us at:{'\n\n'}
            Portugal Vila do Conde{'\n'}
            Email: support@ecodriving.app
          </Text>
        </View>
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
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  agreementSection: {
    marginBottom: 32,
  },
  agreementLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5ca990',
    letterSpacing: 1,
    marginBottom: 8,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f5f5f5',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#999',
  },
  clause: {
    marginBottom: 24,
  },
  clauseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f5f5f5',
    marginBottom: 12,
  },
  clauseText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#ccc',
  },
});