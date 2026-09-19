export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="pgrid" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div className="pcard" key={index}>
          <div className="pcard-media is-loading" />
          <div className="pcard-body">
            <div className="skel" style={{ height: 14, width: '62%' }} />
            <div className="skel" style={{ height: 14, width: '22%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
