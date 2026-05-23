import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class SafePopScope extends StatefulWidget {
  final Widget child;
  final bool isDirty;
  final String title;
  final String warningMessage;
  final String confirmText;
  final String cancelText;

  const SafePopScope({
    super.key,
    required this.child,
    this.isDirty = false,
    this.title = 'Attention',
    this.warningMessage =
        "Des modifications n'ont pas été sauvegardées. Voulez-vous vraiment quitter ?",
    this.confirmText = 'Quitter',
    this.cancelText = 'Annuler',
  });

  @override
  State<SafePopScope> createState() => _SafePopScopeState();
}

class _SafePopScopeState extends State<SafePopScope> {
  bool _forcePop = false;

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: !widget.isDirty || _forcePop,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;

        final shouldPop = await showDialog<bool>(
          context: context,
          builder: (dialogContext) {
            return AlertDialog(
              title: Text(widget.title),
              content: Text(widget.warningMessage),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(dialogContext).pop(false),
                  child: Text(widget.cancelText),
                ),
                TextButton(
                  onPressed: () => Navigator.of(dialogContext).pop(true),
                  child: Text(widget.confirmText),
                ),
              ],
            );
          },
        );

        if (shouldPop == true && context.mounted) {
          setState(() {
            _forcePop = true;
          });
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (context.mounted) {
              context.pop();
            }
          });
        }
      },
      child: widget.child,
    );
  }
}
