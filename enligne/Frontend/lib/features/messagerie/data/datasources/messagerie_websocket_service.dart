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

  Stream<MessageModel> connect(int? consultationId) {
    _controller?.close();
    _controller = StreamController<MessageModel>.broadcast();
    
    final idPath = consultationId ?? 0; // Backend handles both or use separate endpoints
    final query = '?token=$token';
    final url = '$baseUrl/ws/chat/$idPath/$query';
    
    developer.log('Connecting to WebSocket: $url', name: 'MessagerieWebSocket');
    _channel = WebSocketChannel.connect(Uri.parse(url));

    _channel!.stream.listen(
      (data) {
        try {
          final decoded = jsonDecode(data);
          // Handle both formats (nested 'message' or flat)
          final messageJson = decoded.containsKey('message') ? decoded['message'] : decoded;
          _controller?.add(MessageModel.fromJson(messageJson));
        } catch (e) {
          developer.log('Error parsing WebSocket data: $e', name: 'MessagerieWebSocket', error: e);
        }
      },
      onError: (e) => developer.log('WebSocket error: $e', name: 'MessagerieWebSocket', error: e),
      onDone: () => developer.log('WebSocket connection closed', name: 'MessagerieWebSocket'),
    );

    return _controller!.stream;
  }

  void disconnect() {
    _channel?.sink.close();
    _controller?.close();
  }
}
