import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from 'react-compare-slider';

export const CompareSlider = ({
  original,
  restored,
}: {
  original: string;
  restored: string;
}) => {
  return (
    <ReactCompareSlider
      itemOne={<ReactCompareSliderImage src={original} alt='原始照片' />}
      itemTwo={<ReactCompareSliderImage src={restored} alt='修复后照片' />}
      portrait
      className='flex w-[600px] mt-5'
    />
  );
};
