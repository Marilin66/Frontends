import 'dart:async';
import 'dart:convert';
import 'dart:developer' as developer;
import 'package:web_socket_channel/web_socket_channel.dart';
import '../models/message_model.dart';

class MessagerieWebSocketService {
  final String baseUrl;
  final String token;
  WebSocketChannel? _channel;
  StreamController<MessageModel>? _controller;

  MessagerieWebSocketService({required this.baseUrl, required this.token});

  /// Connexion WebSocket.
  /// - [consultationId] != null → ws/chat/{id}/?token=...
  /// - [consultationId] == null → ws/direct/?token=...  (messages directs)
  Stream<MessageModel> connect(int? consultationId) {
    _controller?.close();
    _controller = StreamController<MessageModel>.broadcast();

    final query = '?token=$token';
    final path = consultationId != null
        ? '/ws/chat/$consultationId/$query'
        : '/ws/direct/$query';
    final url = '$baseUrl$path';

    developer.log('Connecting to WebSocket: $url', name: 'MessagerieWebSocket');
    _channel = WebSocketChannel.connect(Uri.parse(url));

    _channel!.stream.listen(
      (data) {
        try {
          final decoded = jsonDecode(data as String) as Map<String, dynamic>;
          // Le backend peut envoyer un objet plat ou { message: {...} }
          final messageJson = decoded.containsKey('message')
              ? decoded['message'] as Map<String, dynamic>
              : decoded;
          _controller?.add(MessageModel.fromJson(messageJson));
        } catch (e) {
          developer.log(
            'Error parsing WebSocket data: $e',
            name: 'MessagerieWebSocket',
            error: e,
          );
        }
      },
      onError: (e) =>
          developer.log('WebSocket error: $e', name: 'MessagerieWebSocket', error: e),
      onDone: () =>
          developer.log('WebSocket connection closed', name: 'MessagerieWebSocket'),
    );

    return _controller!.stream;
  }

  void disconnect() {
    _channel?.sink.close();
    _controller?.close();
    _channel = null;
    _controller = null;
  }
}
