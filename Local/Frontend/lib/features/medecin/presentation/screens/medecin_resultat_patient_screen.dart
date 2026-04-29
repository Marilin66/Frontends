import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/widgets/universal_back_button.dart';

class MedecinResultatPatientScreen extends StatefulWidget {
  const MedecinResultatPatientScreen({super.key});

  @override
  State<MedecinResultatPatientScreen> createState() => _MedecinResultatPatientScreenState();
}

class _MedecinResultatPatientScreenState extends State<MedecinResultatPatientScreen> {
  final _codeController = TextEditingController();
  bool _showResult = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: UniversalBackButton(),
        title: Text('Consulter un résultat', style: GoogleFonts.poppins()),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            TextField(
              controller: _codeController,
              decoration: const InputDecoration(labelText: 'Code de référence (Patient)'),
            ),
            const SizedBox(height: 20),
            ElevatedButton(onPressed: () => setState(() => _showResult = true), child: const Text('Rechercher')),
            if (_showResult) ...[
              const SizedBox(height: 40),
              const Card(child: ListTile(title: Text('Bilan Sanguin'), subtitle: Text('Laboratoire Central - 15/03/2026'))),
            ]
          ],
        ),
      ),
    );
  }
}
