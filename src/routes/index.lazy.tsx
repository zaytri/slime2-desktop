import { createLazyFileRoute } from '@tanstack/react-router';
export const Route = createLazyFileRoute('/')({
  component: Widgets,
});
function Widgets() {
  return (
    <>
      <div className='bg-lime-200 bg-gradient-to-r p-4'>
        <p className='text-2xl font-bold'>Widgets</p>
      </div>
      <div className='p-6'>
        <div className='grid grid-cols-5 gap-4 ' style={{ aspectRatio: 5 / 3 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(value => {
            return (
              <div
                key={value}
                className='flex items-center justify-center  rounded-md border-2 border-green-700 bg-lime-100'
              >
                {value}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
