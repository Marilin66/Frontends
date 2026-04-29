import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';


/// A shimmer placeholder for a single line of text
class ShimmerLine extends StatelessWidget {
  final double width;
  final double height;
  final double borderRadius;

  const ShimmerLine({
    super.key,
    this.width = double.infinity,
    this.height = 16,
    this.borderRadius = 8,
  });

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: Colors.grey.shade300,
      highlightColor: Colors.grey.shade100,
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(borderRadius),
        ),
      ),
    );
  }
}

/// A shimmer placeholder for a card (e.g., dashboard stats, RDV cards)
class ShimmerCard extends StatelessWidget {
  final double height;

  const ShimmerCard({super.key, this.height = 80});

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: Colors.grey.shade300,
      highlightColor: Colors.grey.shade100,
      child: Container(
        height: height,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
        ),
      ),
    );
  }
}

/// A shimmer list — shows multiple shimmer cards stacked
class ShimmerList extends StatelessWidget {
  final int itemCount;
  final double itemHeight;
  final double spacing;

  const ShimmerList({
    super.key,
    this.itemCount = 3,
    this.itemHeight = 80,
    this.spacing = 12,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: List.generate(itemCount, (index) {
        return Padding(
          padding: EdgeInsets.only(bottom: index < itemCount - 1 ? spacing : 0),
          child: ShimmerCard(height: itemHeight),
        );
      }),
    );
  }
}

/// A shimmer grid — shows shimmer cards in a 2-column grid
class ShimmerGrid extends StatelessWidget {
  final int itemCount;
  final double itemHeight;

  const ShimmerGrid({
    super.key,
    this.itemCount = 4,
    this.itemHeight = 100,
  });

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: Colors.grey.shade300,
      highlightColor: Colors.grey.shade100,
      child: GridView.count(
        crossAxisCount: 2,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
        childAspectRatio: 1.5,
        children: List.generate(itemCount, (_) {
          return Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
            ),
          );
        }),
      ),
    );
  }
}

/// A complete dashboard shimmer placeholder
class ShimmerDashboard extends StatelessWidget {
  const ShimmerDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Welcome banner shimmer
          const ShimmerCard(height: 100),
          const SizedBox(height: 24),
          // Quick actions shimmer
          const ShimmerGrid(itemCount: 4, itemHeight: 80),
          const SizedBox(height: 24),
          // Section header shimmer
          const ShimmerLine(width: 180, height: 20),
          const SizedBox(height: 12),
          // List shimmer
          const ShimmerList(itemCount: 3, itemHeight: 80),
        ],
      ),
    );
  }
}
