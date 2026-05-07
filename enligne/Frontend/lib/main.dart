import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

import 'core/routing/app_router.dart';
import 'core/theme/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: ".env");
  await initializeDateFormatting('fr_FR', null);
  runApp(
    const ProviderScope(
      child: HopitelApp(),
    ),
  );
}

class HopitelApp extends ConsumerWidget {
  const HopitelApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Use ref.read instead of ref.watch: the GoRouter must NOT be recreated
    // on every authProvider change. The router already handles auth state
    // changes internally via its refreshListenable (ValueNotifier<AuthState>).
    // Watching here would create a new GoRouter instance on each auth change,
    // causing duplicate Navigator keys and the _keyReservation assertion on Web.
    final router = ref.read(routerProvider);

    return MaterialApp.router(
      title: 'Hopitel',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      routerConfig: router,
      builder: (context, child) {
        return child ?? const SizedBox();
      },
    );
  }
}
