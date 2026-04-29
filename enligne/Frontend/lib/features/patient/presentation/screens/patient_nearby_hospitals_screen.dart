import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:geolocator/geolocator.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:shimmer/shimmer.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/animated_tap.dart';
import '../../../../core/widgets/fluid_card.dart';
import '../../../../core/widgets/universal_back_button.dart';
import '../providers/patient_provider.dart';
import '../../data/models/hopital_search_model.dart';

class PatientNearbyHospitalsScreen extends ConsumerStatefulWidget {
  const PatientNearbyHospitalsScreen({super.key});

  @override
  ConsumerState<PatientNearbyHospitalsScreen> createState() => _PatientNearbyHospitalsScreenState();
}

class _PatientNearbyHospitalsScreenState extends ConsumerState<PatientNearbyHospitalsScreen> {
  final MapController _mapController = MapController();
  Position? _currentPosition;
  bool _locationPermissionGranted = false;
  bool _isLoadingLocation = false;
  final List<Marker> _markers = [];
  int _selectedRadius = 10;

  @override
  void initState() {
    super.initState();
    _requestLocationPermission();
  }

  Future<void> _requestLocationPermission() async {
    setState(() => _isLoadingLocation = true);

    try {
      LocationPermission permission = await Geolocator.checkPermission();

      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }

      if (permission == LocationPermission.deniedForever) {
        setState(() {
          _locationPermissionGranted = false;
          _isLoadingLocation = false;
        });
        if (mounted) {
          _showPermissionDialog();
        }
        return;
      }

      if (permission == LocationPermission.whileInUse || permission == LocationPermission.always) {
        setState(() => _locationPermissionGranted = true);
        await _getCurrentLocation();
      }
    } catch (e) {
      debugPrint('Erreur permission location: $e');
    }

    setState(() => _isLoadingLocation = false);
  }

  Future<void> _getCurrentLocation() async {
    try {
      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 10),
        ),
      );

      setState(() => _currentPosition = position);
      _loadNearbyHospitals();
    } catch (e) {
      debugPrint('Erreur récupération position: $e');
    }
  }

  void _loadNearbyHospitals() {
    if (_currentPosition == null) return;

    ref.read(nearbyHopitauxProvider.notifier).loadNearbyHospitals(
      latitude: _currentPosition!.latitude,
      longitude: _currentPosition!.longitude,
      radius: _selectedRadius,
    );
  }

  void _showPermissionDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Permission de localisation requise'),
        content: const Text(
          'Pour trouver les hôpitaux à proximité, nous avons besoin de votre position. '
          'Veuillez activer la localisation dans les paramètres de votre appareil.',
        ),
        actions: [
          TextButton(
            onPressed: () => context.pop(),
            child: const Text('Annuler'),
          ),
          ElevatedButton(
            onPressed: () {
              context.pop();
              openAppSettings();
            },
            child: const Text('Ouvrir les paramètres'),
          ),
        ],
      ),
    );
  }

  void _updateMarkers(List<HopitalSearchModel> hopitaux) {
    if (!mounted) return;
    setState(() {
      _markers.clear();
      for (var hopital in hopitaux) {
        if (hopital.latitude != null && hopital.longitude != null) {
          _markers.add(
            Marker(
              point: LatLng(hopital.latitude!, hopital.longitude!),
              width: 50.0,
              height: 50.0,
              child: GestureDetector(
                onTap: () {
                  context.go('/patient/hopital/${hopital.id}', extra: hopital);
                },
                child: Column(
                  children: [
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(8),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            blurRadius: 4,
                          )
                        ],
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                      child: Text(
                        hopital.nom,
                        style: const TextStyle(fontSize: 8, fontWeight: FontWeight.bold),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const Icon(Icons.location_on, color: Colors.blue, size: 30),
                  ],
                ),
              ),
            ),
          );
        }
      }
    });

    try {
      if (hopitaux.isNotEmpty && _currentPosition != null) {
          // Centrer la carte sur la zone
          _mapController.move(
            LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
            11.0,
          );
      }
    } catch (e) {
      debugPrint("Map move exception: $e");
    }
  }

  // _calculateBounds supprimé pour utiliser un simple move
  @override
  Widget build(BuildContext context) {
    final hopitauxAsync = ref.watch(nearbyHopitauxProvider);

    hopitauxAsync.whenData((hopitaux) {
      if (_mapController != null) {
        _updateMarkers(hopitaux);
      }
    });

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 140,
            floating: false,
            pinned: true,
            elevation: 0,
            leading: UniversalBackButton(color: Colors.white),
            backgroundColor: AppColors.primary,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [AppColors.primary, AppColors.primaryDark],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 60, 20, 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'Hôpitaux à proximité',
                        style: GoogleFonts.poppins(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      Text(
                        'Trouvez les établissements les plus proches',
                        style: GoogleFonts.poppins(
                          fontSize: 13,
                          color: Colors.white.withOpacity(0.8),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),

          // Carte
          SliverToBoxAdapter(
            child: Container(
              height: 300,
              margin: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 15,
                    offset: const Offset(0, 5),
                  ),
                ],
              ),
              clipBehavior: Clip.antiAlias,
              child: _buildMap(),
            ),
          ),

          // Filtre de rayon
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.03),
                      blurRadius: 10,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Rayon de recherche',
                          style: GoogleFonts.poppins(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            '$_selectedRadius km',
                            style: GoogleFonts.poppins(
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primary,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: SliderTheme(
                            data: SliderThemeData(
                              activeTrackColor: AppColors.primary,
                              inactiveTrackColor: AppColors.primary.withOpacity(0.2),
                              thumbColor: AppColors.primary,
                              overlayColor: AppColors.primary.withOpacity(0.1),
                            ),
                            child: Slider(
                              value: _selectedRadius.toDouble(),
                              min: 5,
                              max: 50,
                              divisions: 9,
                              label: '$_selectedRadius km',
                              onChanged: (value) {
                                setState(() => _selectedRadius = value.round());
                              },
                              onChangeEnd: (value) {
                                if (_currentPosition != null) {
                                  _loadNearbyHospitals();
                                }
                              },
                            ),
                          ),
                        ),
                      ],
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('5 km', style: GoogleFonts.poppins(fontSize: 11, color: AppColors.textSecondary)),
                        Text('50 km', style: GoogleFonts.poppins(fontSize: 11, color: AppColors.textSecondary)),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: 20)),

          // Liste des hôpitaux
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Text(
                'Résultats',
                style: GoogleFonts.poppins(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
            ),
          ),

          hopitauxAsync.when(
            loading: () => SliverFillRemaining(
              child: Center(
                child: Shimmer.fromColors(
                  baseColor: AppColors.surface,
                  highlightColor: AppColors.surface.withOpacity(0.5),
                  child: Container(
                    width: 200,
                    height: 20,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                ),
              ),
            ),
            error: (err, _) => SliverFillRemaining(
              child: _buildErrorState(err.toString()),
            ),
            data: (hopitaux) {
              if (hopitaux.isEmpty) {
                return SliverFillRemaining(
                  hasScrollBody: false,
                  child: _buildEmptyState(),
                );
              }

              return SliverPadding(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 80),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) => _buildHopitalCard(hopitaux[index]),
                    childCount: hopitaux.length,
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildMap() {
    if (_isLoadingLocation) {
      return Center(
        child: Shimmer.fromColors(
          baseColor: AppColors.surface,
          highlightColor: AppColors.surface.withOpacity(0.5),
          child: Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
            ),
          ),
        ),
      );
    }

    if (!_locationPermissionGranted) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.location_off_outlined, size: 50, color: AppColors.textSecondary.withOpacity(0.5)),
            const SizedBox(height: 12),
            Text(
              'Localisation non activée',
              style: GoogleFonts.poppins(color: AppColors.textSecondary),
            ),
            const SizedBox(height: 12),
            ElevatedButton.icon(
              onPressed: _requestLocationPermission,
              icon: const Icon(Icons.my_location),
              label: const Text('Activer'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      );
    }

    final initialPosition = _currentPosition != null
        ? LatLng(_currentPosition!.latitude, _currentPosition!.longitude)
        : const LatLng(6.3703, 2.3912);

    final markersToShow = List<Marker>.from(_markers);
    if (_currentPosition != null) {
      markersToShow.add(
        Marker(
          point: initialPosition,
          width: 40,
          height: 40,
          child: const Icon(Icons.my_location, color: Colors.blue, size: 30),
        ),
      );
    }

    return Stack(
      children: [
        FlutterMap(
          mapController: _mapController,
          options: MapOptions(
            initialCenter: initialPosition,
            initialZoom: 12.0,
            onMapReady: () {
              final currentHopitaux = ref.read(nearbyHopitauxProvider).asData?.value;
              if (currentHopitaux != null) {
                _updateMarkers(currentHopitaux);
              }
            },
          ),
          children: [
            TileLayer(
              urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
              userAgentPackageName: 'com.hopitel.app',
            ),
            MarkerLayer(markers: markersToShow),
          ],
        ),
        Positioned(
          bottom: 12,
          right: 12,
          child: Column(
            children: [
              FloatingActionButton(
                heroTag: 'location',
                mini: true,
                backgroundColor: Colors.white,
                onPressed: () {
                  if (_currentPosition != null) {
                    _mapController.move(
                      LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
                      13.0,
                    );
                  }
                },
                child: const Icon(Icons.my_location, color: AppColors.primary, size: 20),
              ),
              const SizedBox(height: 8),
              FloatingActionButton(
                heroTag: 'zoom_in',
                mini: true,
                backgroundColor: Colors.white,
                onPressed: () {
                  try {
                    final zoom = _mapController.camera.zoom + 1;
                    _mapController.move(_mapController.camera.center, zoom);
                  } catch (e) {
                    debugPrint('Erreur zoom: $e');
                  }
                },
                child: const Icon(Icons.add, color: AppColors.primary, size: 20),
              ),
              const SizedBox(height: 8),
              FloatingActionButton(
                heroTag: 'zoom_out',
                mini: true,
                backgroundColor: Colors.white,
                onPressed: () {
                  try {
                    final zoom = _mapController.camera.zoom - 1;
                    _mapController.move(_mapController.camera.center, zoom);
                  } catch (e) {
                    debugPrint('Erreur zoom: $e');
                  }
                },
                child: const Icon(Icons.remove, color: AppColors.primary, size: 20),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildHopitalCard(HopitalSearchModel hopital) {
    final distance = _currentPosition != null &&
            hopital.latitude != null && hopital.longitude != null
        ? _calculateDistance(
            _currentPosition!.latitude,
            _currentPosition!.longitude,
            hopital.latitude!,
            hopital.longitude!,
          )
        : null;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          onTap: () => context.go('/patient/hopital/${hopital.id}', extra: hopital),
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 70,
                  height: 70,
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Center(
                    child: Icon(Icons.business_rounded, color: AppColors.primary, size: 32),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        hopital.nom,
                        style: GoogleFonts.poppins(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.location_on, size: 14, color: AppColors.primary),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              hopital.ville,
                              style: GoogleFonts.poppins(
                                fontSize: 12,
                                color: AppColors.textSecondary,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      if (distance != null) ...[
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.secondary.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.directions_walk, size: 12, color: AppColors.secondary),
                              const SizedBox(width: 4),
                              Text(
                                '${distance.toStringAsFixed(1)} km',
                                style: GoogleFonts.poppins(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.secondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                const Icon(Icons.chevron_right, color: AppColors.textHint),
              ],
            ),
          ),
        ),
      ),
    );
  }

  double _calculateDistance(double lat1, double lon1, double lat2, double lon2) {
    const p = 0.017453292519943295;
    const c = cos;
    final a = 0.5 - c((lat2 - lat1) * p) / 2 +
        c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p)) / 2;
    return 12742 * asin(sqrt(a));
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.search_off_rounded, size: 60, color: Colors.grey.shade200),
          const SizedBox(height: 12),
          Text(
            'Aucun hôpital trouvé',
            style: GoogleFonts.poppins(
              fontSize: 15,
              fontWeight: FontWeight.w600,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Essayez d\'augmenter le rayon',
            style: GoogleFonts.poppins(
              fontSize: 12,
              color: AppColors.textHint,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(String error) {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline_rounded, size: 50, color: AppColors.error),
            const SizedBox(height: 12),
            Text(
              'Une erreur est survenue',
              style: GoogleFonts.poppins(
                fontSize: 15,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              error,
              textAlign: TextAlign.center,
              style: GoogleFonts.poppins(
                fontSize: 11,
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                if (_currentPosition != null) {
                  _loadNearbyHospitals();
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
              ),
              child: const Text('Réessayer'),
            ),
          ],
        ),
      ),
    );
  }
}
