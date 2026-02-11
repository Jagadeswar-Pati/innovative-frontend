import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Star } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { commentsApi, ordersApi, reviewsApi, Review, Comment } from '@/services/api';

interface ProductReviewsProps {
  productId: string;
}

const StarRating = ({
  value,
  onChange,
  size = 16,
}: {
  value: number;
  onChange?: (val: number) => void;
  size?: number;
}) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: 5 }).map((_, idx) => {
      const ratingValue = idx + 1;
      const active = ratingValue <= value;
      return (
        <button
          key={ratingValue}
          type="button"
          onClick={() => onChange?.(ratingValue)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
          aria-label={`${ratingValue} star`}
        >
          <Star
            className={`${active ? 'text-yellow-400' : 'text-muted-foreground'} ${onChange ? 'hover:text-yellow-300' : ''}`}
            style={{ width: size, height: size }}
            fill={active ? 'currentColor' : 'none'}
          />
        </button>
      );
    })}
  </div>
);

const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [eligibleOrderId, setEligibleOrderId] = useState<string>('');
  const [reviewMode, setReviewMode] = useState<'any-user' | 'delivered-only'>('delivered-only');

  const [form, setForm] = useState({
    rating: 0,
    valueForMoney: 0,
    durability: 0,
    deliverySpeed: 0,
    comment: '',
    pros: '',
    cons: '',
  });

  const canSubmit =
    form.rating > 0 &&
    form.comment.trim().length > 0 &&
    (reviewMode === 'any-user' || !!eligibleOrderId);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [reviewRes, commentRes, modeRes] = await Promise.all([
          reviewsApi.getByProduct(productId).catch(() => null),
          commentsApi.getByProduct(productId).catch(() => null),
          reviewsApi.getMode().catch(() => null),
        ]);
        const reviewList = (reviewRes as { data?: Review[] })?.data || [];
        const commentList = (commentRes as { data?: Comment[] })?.data || [];
        const mode = (modeRes as { data?: { mode?: 'any-user' | 'delivered-only' } })?.data?.mode;
        const approvedReviews = Array.isArray(reviewList)
          ? reviewList.filter((r) => (r as Review & { status?: string }).status === 'approved' || !(r as Review & { status?: string }).status)
          : [];
        setReviews(approvedReviews);
        setComments(Array.isArray(commentList) ? commentList : []);
        if (mode) setReviewMode(mode);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [productId]);

  useEffect(() => {
    if (!isAuthenticated) {
      setEligibleOrderId('');
      return;
    }
    const loadEligibleOrder = async () => {
      try {
        const res = await ordersApi.getMyOrders();
        const orders = (res as { data?: Array<{ _id: string; orderStatus: string; products: Array<{ productId: string }> }> }).data || [];
        const delivered = orders.find(
          (o) => o.orderStatus === 'Delivered' && o.products.some((p) => p.productId === productId)
        );
        setEligibleOrderId(delivered?._id || '');
      } catch {
        setEligibleOrderId('');
      }
    };
    loadEligibleOrder();
  }, [isAuthenticated, productId]);

  const ratingSummary = useMemo(() => {
    if (!reviews.length) return { average: 0, total: 0, counts: [0, 0, 0, 0, 0] };
    const counts = [0, 0, 0, 0, 0];
    let total = 0;
    reviews.forEach((r) => {
      const rating = Math.round(Number(r.rating) || 0);
      if (rating >= 1 && rating <= 5) counts[rating - 1] += 1;
      total += rating;
    });
    return { average: total / reviews.length, total: reviews.length, counts };
  }, [reviews]);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await reviewsApi.create({
      productId,
      orderId: eligibleOrderId || undefined,
      rating: form.rating,
      valueForMoney: form.valueForMoney || undefined,
      durability: form.durability || undefined,
      deliverySpeed: form.deliverySpeed || undefined,
      comment: form.comment.trim(),
      pros: form.pros.trim() || undefined,
      cons: form.cons.trim() || undefined,
    });
    setShowModal(false);
    setForm({ rating: 0, valueForMoney: 0, durability: 0, deliverySpeed: 0, comment: '', pros: '', cons: '' });
    const reviewRes = await reviewsApi.getByProduct(productId).catch(() => null);
    const reviewList = (reviewRes as { data?: Review[] })?.data || [];
    const approvedReviews = Array.isArray(reviewList)
      ? reviewList.filter((r) => (r as Review & { status?: string }).status === 'approved' || !(r as Review & { status?: string }).status)
      : [];
    setReviews(approvedReviews);
  };

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-foreground mb-6">Reviews & Comments</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ratings Summary */}
        <div className="bg-secondary/20 rounded-xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div>
              <p className="text-4xl font-bold text-foreground">{ratingSummary.average.toFixed(1)}</p>
              <StarRating value={Math.round(ratingSummary.average)} size={18} />
              <p className="text-sm text-muted-foreground mt-1">{ratingSummary.total} ratings</p>
            </div>
          </div>

          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingSummary.counts[star - 1] || 0;
              const percent = ratingSummary.total ? (count / ratingSummary.total) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1 w-14">
                    <span>{star}</span>
                    <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                  </div>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
                  </div>
                  <span className="w-10 text-right text-muted-foreground">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Review Input */}
        <div className="bg-secondary/20 rounded-xl p-6 flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-foreground">Write a review</h3>
          {!isAuthenticated ? (
            <>
              <p className="text-sm text-muted-foreground">Please login to submit a review</p>
              <Link to="/login">
                <Button>Login</Button>
              </Link>
            </>
          ) : reviewMode === 'delivered-only' && !eligibleOrderId ? (
            <p className="text-sm text-muted-foreground">
              You can submit a review after your order is delivered.
            </p>
          ) : (
            <Button onClick={() => setShowModal(true)} className="w-fit">
              Add Review
            </Button>
          )}
        </div>
      </div>

      {/* Reviews & Comments List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Reviews</h3>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="border border-border rounded-xl p-4 bg-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const profile =
                        typeof review.userId === 'object'
                          ? (review.userId as { profileImage?: string }).profileImage
                          : review.userProfileImage;
                      const name =
                        review.userName ||
                        (typeof review.userId === 'object'
                          ? (review.userId as { name?: string }).name
                          : '');
                      const initial = (name || 'U').charAt(0).toUpperCase();
                      return profile ? (
                        <img
                          src={profile}
                          alt={name || 'User'}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                          {initial}
                        </div>
                      );
                    })()}
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {review.userName ||
                          (typeof review.userId === 'object'
                            ? (review.userId as { name?: string }).name
                            : 'User')}
                      </p>
                      <StarRating value={Number(review.rating) || 0} size={14} />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-IN') : ''}
                  </span>
                </div>
                <p className="text-sm text-foreground mt-2">{review.comment || ''}</p>
                {(review.pros || review.cons) && (
                  <div className="mt-3 text-xs text-muted-foreground space-y-1">
                    {review.pros && <p><strong>Pros:</strong> {review.pros}</p>}
                    {review.cons && <p><strong>Cons:</strong> {review.cons}</p>}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Comments</h3>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No comments yet.</p>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="border border-border rounded-xl p-4 bg-card">
                <p className="text-sm text-foreground">{comment.comment}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('en-IN') : ''}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Review Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogTitle className="text-lg font-semibold">Submit a Review</DialogTitle>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Overall Rating *</p>
              <StarRating value={form.rating} onChange={(val) => setForm({ ...form, rating: val })} size={18} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Value for Money</p>
                <StarRating value={form.valueForMoney} onChange={(val) => setForm({ ...form, valueForMoney: val })} size={14} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Durability</p>
                <StarRating value={form.durability} onChange={(val) => setForm({ ...form, durability: val })} size={14} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Delivery Speed</p>
                <StarRating value={form.deliverySpeed} onChange={(val) => setForm({ ...form, deliverySpeed: val })} size={14} />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Review *</p>
              <Textarea
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                rows={4}
                placeholder="Write your review..."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Pros</p>
                <Input value={form.pros} onChange={(e) => setForm({ ...form, pros: e.target.value })} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Cons</p>
                <Input value={form.cons} onChange={(e) => setForm({ ...form, cons: e.target.value })} />
              </div>
            </div>
            <Button onClick={handleSubmit} disabled={!canSubmit} className="w-full">
              Submit Review
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ProductReviews;
