const { Order, OrderTrackingHistory, User, OrderItem, Product } = require('../models');
const { Op } = require('sequelize');

// Generate tracking number
const generateTrackingNumber = () => {
    const prefix = 'ECP'; // EcoPick
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${prefix}${timestamp}${random}`;
};

// GET /api/tracking/:trackingNumber - Public tracking
exports.trackOrder = async (req, res) => {
    try {
        const { trackingNumber } = req.params;

        const order = await Order.findOne({
            where: { tracking_number: trackingNumber },
            include: [
                {
                    model: User,
                    attributes: ['full_name']
                },
                {
                    model: OrderItem,
                    include: [{ 
                        model: Product, 
                        attributes: ['name', 'image_url'] 
                    }]
                }
            ]
        });

        if (!order) {
            return res.status(404).send({ 
                message: "Nomor tracking tidak ditemukan." 
            });
        }

        // Get tracking history
        const trackingHistory = await OrderTrackingHistory.findAll({
            where: { order_id: order.id },
            include: [{
                model: User,
                as: 'updatedBy',
                attributes: ['full_name']
            }],
            order: [['createdAt', 'ASC']]
        });

        // Calculate delivery progress
        const statusOrder = [
            'pending', 'paid', 'confirmed', 'processing', 
            'packed', 'shipped', 'out_for_delivery', 'delivered'
        ];
        
        const currentStatusIndex = statusOrder.indexOf(order.status);
        const progressPercentage = Math.max(0, (currentStatusIndex / (statusOrder.length - 1)) * 100);

        res.status(200).send({
            order: {
                id: order.id,
                tracking_number: order.tracking_number,
                status: order.status,
                total_amount: order.total_amount,
                shipping_address: order.shipping_address,
                estimated_delivery: order.estimated_delivery,
                actual_delivery: order.actual_delivery,
                courier_name: order.courier_name,
                tracking_url: order.tracking_url,
                createdAt: order.createdAt,
                customer_name: order.User.full_name,
                items: order.OrderItems
            },
            tracking_history: trackingHistory,
            progress: {
                percentage: Math.round(progressPercentage),
                current_status: order.status,
                is_delivered: order.status === 'delivered'
            }
        });

    } catch (error) {
        res.status(500).send({ 
            message: "Gagal melakukan tracking: " + error.message 
        });
    }
};

// POST /api/admin/orders/:id/update-tracking - Admin update tracking
exports.updateOrderTracking = async (req, res) => {
    try {
        const orderId = req.params.id;
        const adminId = req.userId;
        const { 
            status, 
            status_description, 
            location, 
            notes,
            courier_name,
            tracking_url,
            estimated_delivery 
        } = req.body;

        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).send({ 
                message: "Pesanan tidak ditemukan." 
            });
        }

        // Generate tracking number if not exists
        let trackingNumber = order.tracking_number;
        if (!trackingNumber) {
            trackingNumber = generateTrackingNumber();
        }

        // Update order
        const updateData = { status, tracking_number: trackingNumber };
        if (courier_name) updateData.courier_name = courier_name;
        if (tracking_url) updateData.tracking_url = tracking_url;
        if (estimated_delivery) updateData.estimated_delivery = new Date(estimated_delivery);
        if (status === 'delivered') updateData.actual_delivery = new Date();

        await order.update(updateData);

        // Add tracking history
        await OrderTrackingHistory.create({
            order_id: orderId,
            status: status,
            status_description: status_description || getDefaultStatusDescription(status),
            location: location,
            notes: notes,
            updated_by: adminId
        });

        // Get updated order with history
        const updatedOrder = await Order.findByPk(orderId, {
            include: [{
                model: User,
                attributes: ['full_name', 'email']
            }]
        });

        // TODO: Send notification to customer (email/SMS)
        // await sendOrderStatusNotification(updatedOrder);

        res.status(200).send({
            message: "Status pesanan berhasil diperbarui!",
            order: updatedOrder,
            tracking_number: trackingNumber
        });

    } catch (error) {
        res.status(500).send({ 
            message: "Gagal memperbarui tracking: " + error.message 
        });
    }
};

const getDefaultStatusDescription = (status) => {
    const descriptions = {
        'pending': 'Pesanan menunggu pembayaran',
        'paid': 'Pembayaran berhasil dikonfirmasi',
        'confirmed': 'Pesanan dikonfirmasi dan diproses',
        'processing': 'Pesanan sedang diproses',
        'packed': 'Pesanan sudah dikemas dan siap dikirim',
        'shipped': 'Pesanan dalam perjalanan',
        'out_for_delivery': 'Pesanan dalam pengiriman terakhir',
        'delivered': 'Pesanan telah sampai di tujuan',
        'cancelled': 'Pesanan dibatalkan',
        'returned': 'Pesanan dikembalikan'
    };
    return descriptions[status] || 'Status pesanan diperbarui';
};

// GET /api/user/orders/:id/tracking - Customer tracking
exports.getMyOrderTracking = async (req, res) => {
    try {
        const userId = req.userId;
        const orderId = req.params.id;

        const order = await Order.findOne({
            where: { id: orderId, user_id: userId },
            include: [{
                model: OrderItem,
                include: [{ 
                    model: Product, 
                    attributes: ['name', 'image_url'] 
                }]
            }]
        });

        if (!order) {
            return res.status(404).send({ 
                message: "Pesanan tidak ditemukan." 
            });
        }

        if (!order.tracking_number) {
            return res.status(200).send({
                message: "Nomor tracking belum tersedia untuk pesanan ini.",
                order: {
                    id: order.id,
                    status: order.status,
                    total_amount: order.total_amount,
                    createdAt: order.createdAt,
                    items: order.OrderItems
                },
                tracking_available: false
            });
        }

        // Get tracking history
        const trackingHistory = await OrderTrackingHistory.findAll({
            where: { order_id: order.id },
            order: [['createdAt', 'ASC']]
        });

        res.status(200).send({
            order: {
                id: order.id,
                tracking_number: order.tracking_number,
                status: order.status,
                total_amount: order.total_amount,
                shipping_address: order.shipping_address,
                estimated_delivery: order.estimated_delivery,
                courier_name: order.courier_name,
                tracking_url: order.tracking_url,
                createdAt: order.createdAt,
                items: order.OrderItems
            },
            tracking_history: trackingHistory,
            tracking_available: true
        });

    } catch (error) {
        res.status(500).send({ 
            message: "Gagal mengambil tracking pesanan: " + error.message 
        });
    }
};